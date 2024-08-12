import {raceSignal} from 'race-signal';
import {USE_SUBDOMAINS, USE_SESSIONS} from './constants.js';
import {dnsLinkLabelEncoder, isInlinedDnsLink} from './dns-link-labels.js';
import {getFullUrlFromFastifyRequest, getRequestAwareSignal} from './helia-server.js';
import {getIpnsAddressDetails} from './ipns-address-utils.js';

let log = undefined

export const httpGateway = (opts) => {
    log = opts.helia.logger.forComponent('http-gateway')

    /**
     * Redirects to the subdomain gateway.
     */
    async function handleEntry(request, reply) {
        const {params} = request
        log('fetch request %s', request.url)
        const {ns: namespace, '*': relativePath, address} = params

        log('handling entry: ', {address, namespace, relativePath})

        if (!USE_SUBDOMAINS) {
            log('subdomains are disabled, fetching without subdomain')
            return verifiedFetch(request, reply)
        } else {
            log('subdomains are enabled, redirecting to subdomain')
        }

        const {peerId, cid} = getIpnsAddressDetails(address)

        if (peerId != null) {
            return verifiedFetch(request, reply)
        }

        const cidv1Address = cid?.toString()

        const query = request.query
        log.trace('query: ', query)

        if (query != null) {
        }

        let encodedDnsLink = address

        if (!isInlinedDnsLink(address)) {
            encodedDnsLink = dnsLinkLabelEncoder(address)
        }

        const finalUrl = `${request.protocol}://${cidv1Address ?? encodedDnsLink}.${namespace}.${request.headers.host}/${relativePath ?? ''}`
        log('redirecting to final URL:', finalUrl)

        reply.setHeader('Location', finalUrl);
        reply.statusCode = 301
        reply.end()
    }

    async function verifiedFetch(request, reply) {
        const url = getFullUrlFromFastifyRequest(request, log)

        log('fetching url "%s" with @helia/verified-fetch', url)

        const signal = getRequestAwareSignal(request, log, {
            url
        })

        // if subdomains are disabled, have @helia/verified-fetch follow redirects
        // internally, otherwise let the client making the request do it
        const resp = await opts.fetch(url, {
            signal,
            redirect: USE_SUBDOMAINS ? 'manual' : 'follow',
            session: USE_SESSIONS
        })

        await convertVerifiedFetchResponseToFastifyReply(url, resp, reply, {
            signal
        })
    }

    async function convertVerifiedFetchResponseToFastifyReply(url, verifiedFetchResponse, reply, options) {
        if (!verifiedFetchResponse.ok) {
            log('verified-fetch response for %s not ok: ', url, verifiedFetchResponse.status);
            await reply.code(verifiedFetchResponse.status).send(verifiedFetchResponse.statusText);
            return;
        }
        const contentType = verifiedFetchResponse.headers.get('content-type');
        if (contentType == null) {
            log('verified-fetch response for %s has no content-type', url);
            await reply.code(200).send(verifiedFetchResponse.body);
            return;
        }
        console.info('content type', contentType);
        console.info('reply', verifiedFetchResponse);
        if (verifiedFetchResponse.body == null) {
            // this should never happen
            log('verified-fetch response for %s has no body', url);
            await reply.code(501).send('empty');
            return;
        }
        const headers = {};
        for (const [headerName, headerValue] of verifiedFetchResponse.headers.entries()) {
            headers[headerName] = headerValue;
        }
        // Fastify really does not like streams despite what the documentation and
        // github issues say
        const reader = verifiedFetchResponse.body.getReader();
        console.log('verifiedFetchResponse: ', verifiedFetchResponse)
        console.log('headers: ', headers)
        // reply.set()
        // res.set(field, [value])
        reply.status(verifiedFetchResponse.status);
        reply.set(headers)
        // reply.raw.writeHead(verifiedFetchResponse.status, headers);
        try {
            let done = false;
            let value = undefined;
            while (!done) {
                ({ done, value } = await raceSignal(reader.read(), options.signal));
                if (value != null) {
                    reply.write(Buffer.from(value), 'utf8', () => {
                        console.log("Writing Buffer Data...");
                    });
                    // reply.raw.write(Buffer.from(value));
                }
            }
        }
        catch (err) {
            log.error('error reading response for %s', url, err);
            await reader.cancel(err);
        }
        finally {
            log.error('reading response for %s ended', url);
            reply.end();
        }
    }

    return [{
        // without this non-wildcard postfixed path, the '/*' route will match first.
        url: '/:ns(ipfs|ipns)/:address', // ipns/dnsLink or ipfs/cid
        method: 'GET',
        handler: async (request, reply) => handleEntry(request, reply)
    }, {
        url: '/:ns(ipfs|ipns)/:address/*', // ipns/dnsLink/relativePath or ipfs/cid/relativePath
        method: 'GET',
        handler: async (request, reply) => handleEntry(request, reply)
    }, {
        url: '/*',
        method: 'GET',
        handler: async (request, reply) => {
            try {
                await verifiedFetch(request, reply)
            } catch {
                await reply.status(200).send('try /ipfs/<cid> or /ipns/<name>')
            }
        }
    }, {
        url: '/',
        method: 'GET',
        handler: async (request, reply) => {
            if (USE_SUBDOMAINS && request.hostname.split('.').length > 1) {
                return verifiedFetch(request, reply)
            } else {
                await reply.status(200).send('try /ipfs/<cid> or /ipns/<name>')
            }
        }
    }]
};