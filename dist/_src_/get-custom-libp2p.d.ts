import { type Identify } from '@libp2p/identify';
import { type KadDHT } from '@libp2p/kad-dht';
import type { Libp2p, ServiceMap } from '@libp2p/interface';
import type { HeliaInit } from 'helia';
interface HeliaGatewayLibp2pServices extends ServiceMap {
    dht?: KadDHT;
    delegatedRouting?: unknown;
    identify: Identify;
}
interface HeliaGatewayLibp2pOptions extends Partial<Pick<HeliaInit, 'datastore'>> {
}
export declare function getCustomLibp2p({ datastore }: HeliaGatewayLibp2pOptions): Promise<Libp2p<HeliaGatewayLibp2pServices>>;
export {};
//# sourceMappingURL=get-custom-libp2p.d.ts.map