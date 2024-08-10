import type { VerifiedFetch } from '@helia/verified-fetch';
import type { RouteOptions } from 'fastify';
import type { Helia } from 'helia';
export interface HeliaRPCAPIOptions {
    helia: Helia;
    fetch: VerifiedFetch;
}
export declare function rpcApi(opts: HeliaRPCAPIOptions): RouteOptions[];
//# sourceMappingURL=helia-rpc-api.d.ts.map