import type { VerifiedFetch } from '@helia/verified-fetch';
import type { RouteOptions } from 'fastify';
import type { Helia } from 'helia';
export interface HeliaHTTPGatewayOptions {
    helia: Helia;
    fetch: VerifiedFetch;
}
export declare function httpGateway(opts: HeliaHTTPGatewayOptions): RouteOptions[];
//# sourceMappingURL=helia-http-gateway.d.ts.map