import { raceSignal } from 'race-signal';
import { USE_SUBDOMAINS, USE_SESSIONS } from './constants.js';
import { dnsLinkLabelEncoder, isInlinedDnsLink } from './dns-link-labels.js';
import { getFullUrlFromFastifyRequest, getRequestAwareSignal } from './helia-server.js';
import { getIpnsAddressDetails } from './ipns-address-utils.js';
export function httpGateway(opts) {
    const log = opts.helia.logger.forComponent('http-gateway');
    /**
     * Redirects to the subdomain gateway.
     */
    async function handleEntry(request, reply) {
        const { params } = request;
        log('fetch request %s', request.url);
        const { ns: namespace, '*': relativePath, address } = params;
        log('handling entry: ', { address, namespace, relativePath });
        if (!USE_SUBDOMAINS) {
            log('subdomains are disabled, fetching without subdomain');
            return fetch(request, reply);
        }
        else {
            log('subdomains are enabled, redirecting to subdomain');
        }
        const { peerId, cid } = getIpnsAddressDetails(address);
        if (peerId != null) {
            return fetch(request, reply);
        }
        const cidv1Address = cid?.toString();
        const query = request.query;
        log.trace('query: ', query);
        // eslint-disable-next-line no-warning-comments
        // TODO: enable support for query params
        if (query != null) {
            // http://localhost:8090/ipfs/bafybeie72edlprgtlwwctzljf6gkn2wnlrddqjbkxo3jomh4n7omwblxly/dir?format=raw
            // eslint-disable-next-line no-warning-comments
            // TODO: temporary ipfs gateway spec?
            // if (query.uri != null) {
            // // Test = http://localhost:8080/ipns/?uri=ipns%3A%2F%2Fdnslink-subdomain-gw-test.example.org
            //   log('got URI query parameter: ', query.uri)
            //   const url = new URL(query.uri)
            //   address = url.hostname
            // }
            // finalUrl += encodeURIComponent(`?${new URLSearchParams(request.query).toString()}`)
        }
        let encodedDnsLink = address;
        if (!isInlinedDnsLink(address)) {
            encodedDnsLink = dnsLinkLabelEncoder(address);
        }
        const finalUrl = `${request.protocol}://${cidv1Address ?? encodedDnsLink}.${namespace}.${request.hostname}/${relativePath ?? ''}`;
        log('redirecting to final URL:', finalUrl);
        await reply
            .headers({
            Location: finalUrl
        })
            .code(301)
            .send();
    }
    /**
     * Fetches a content for a subdomain, which basically queries delegated
     * routing API and then fetches the path from helia.
     */
    async function fetch(request, reply) {
        const url = getFullUrlFromFastifyRequest(request, log);
        log('fetching url "%s" with @helia/verified-fetch', url);
        console.log('--------------', url)
        const signal = getRequestAwareSignal(request, log, {
            url
        });

        console.log('------------', opts)
        // if subdomains are disabled, have @helia/verified-fetch follow redirects
        // internally, otherwise let the client making the request do it
        const resp = await opts.fetch(url, {
            signal,
            redirect: USE_SUBDOMAINS ? 'manual' : 'follow',
            session: USE_SESSIONS
        });
        await convertVerifiedFetchResponseToFastifyReply(url, resp, reply, {
            signal
        });
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
        reply.raw.writeHead(verifiedFetchResponse.status, headers);
        try {
            let done = false;
            let value = undefined;
            while (!done) {
                ({ done, value } = await raceSignal(reader.read(), options.signal));
                if (value != null) {
                    reply.raw.write(Buffer.from(value));
                }
            }
        }
        catch (err) {
            log.error('error reading response for %s', url, err);
            await reader.cancel(err);
        }
        finally {
            log.error('reading response for %s ended', url);
            reply.raw.end();
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
                    await fetch(request, reply);
                }
                catch {
                    await reply.code(200).send('try /ipfs/<cid> or /ipns/<name>');
                }
            }
        }, {
            url: '/',
            method: 'GET',
            handler: async (request, reply) => {
                if (USE_SUBDOMAINS && request.hostname.split('.').length > 1) {
                    console.log('-------------- 1 ----------------');
                    return fetch(request, reply);
                }
                console.log('-------------- 2 ----------------');
                await reply.code(200).send('try /ipfs/<cid> or /ipns/<name>');
            }
        }];
}
//# sourceMappingURL=helia-http-gateway.js.map