/**
 * We can receive either IPNS Name string or DNSLink label string here.
 * IPNS Names do not have dots or dashes.
 */
export declare function isValidDnsLabel(label: string): boolean;
/**
 * Checks if label looks like inlined DNSLink.
 * (https://specs.ipfs.tech/http-gateways/subdomain-gateway/#host-request-header)
 */
export declare function isInlinedDnsLink(label: string): boolean;
/**
 * DNSLink label decoding
 * * Every standalone - is replaced with .
 * * Every remaining -- is replaced with -
 *
 * @example en-wikipedia--on--ipfs-org.ipns.example.net -> example.net/ipns/en.wikipedia-on-ipfs.org
 */
export declare function dnsLinkLabelDecoder(linkLabel: string): string;
/**
 * DNSLink label encoding:
 * * Every - is replaced with --
 * * Every . is replaced with -
 *
 * @example example.net/ipns/en.wikipedia-on-ipfs.org → Host: en-wikipedia--on--ipfs-org.ipns.example.net
 */
export declare function dnsLinkLabelEncoder(linkLabel: string): string;
//# sourceMappingURL=dns-link-labels.d.ts.map