import type { Logger } from '@libp2p/interface';
import type { FastifyRequest } from 'fastify';
export declare function getFullUrlFromFastifyRequest(request: FastifyRequest, log: Logger): string;
export interface GetRequestAwareSignalOpts {
    timeout?: number;
    url?: string;
}
export declare function getRequestAwareSignal(request: any, log: Logger, options?: GetRequestAwareSignalOpts): any;
//# sourceMappingURL=helia-server.d.ts.map