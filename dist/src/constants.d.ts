/**
 * Where we listen for gateway requests
 */
export declare const HTTP_PORT: number;
/**
 * Where we listen for RPC API requests
 */
export declare const RPC_PORT: number;
export declare const HOST: string;
export declare const DEBUG: string;
export declare const FASTIFY_DEBUG: string;
export declare const USE_SUBDOMAINS: boolean;
export declare const USE_SESSIONS: boolean;
export declare const ECHO_HEADERS: boolean;
/**
 * If set to any value other than 'true', we will disable prometheus metrics.
 *
 * @default 'true'
 */
export declare const METRICS: string;
/**
 * If not set, we will enable bitswap by default.
 */
export declare const USE_BITSWAP: boolean;
/**
 * If not set, we will use the default gateways that come from https://github.com/ipfs/helia/blob/43932a54036dafdf1265b034b30b12784fd22d82/packages/helia/src/block-brokers/trustless-gateway/index.ts
 */
export declare const TRUSTLESS_GATEWAYS: string[] | undefined;
/**
 * If not set, we will use trustless gateways by default.
 */
export declare const USE_TRUSTLESS_GATEWAYS: boolean;
/**
 * If not set, we will enable libp2p by default.
 */
export declare const USE_LIBP2P: boolean;
/**
 * If not set, we will use a memory datastore by default.
 */
export declare const FILE_DATASTORE_PATH: string | undefined;
/**
 * If not set, we will use a memory blockstore by default.
 */
export declare const FILE_BLOCKSTORE_PATH: string | undefined;
/**
 * Whether to use the delegated routing v1 API. Defaults to true.
 */
export declare const USE_DELEGATED_ROUTING: boolean;
/**
 * Whether to use the DHT for routing
 *
 * @default true
 */
export declare const USE_DHT_ROUTING: boolean;
/**
 * If not set, we will default delegated routing to `https://delegated-ipfs.dev`
 */
export declare const DELEGATED_ROUTING_V1_HOST: string;
/**
 * How long to wait for GC to complete
 */
export declare const GC_TIMEOUT_MS = 20000;
/**
 * How long to wait for the healthcheck retrieval of an identity CID to complete
 */
export declare const HEALTHCHECK_TIMEOUT_MS = 1000;
//# sourceMappingURL=constants.d.ts.map