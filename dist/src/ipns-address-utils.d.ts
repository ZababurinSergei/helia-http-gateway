import { CID } from 'multiformats/cid';
import type { PeerId } from '@libp2p/interface';
interface IpnsAddressDetails {
    peerId: PeerId | null;
    cid: CID | null;
}
/**
 * This method should be called with the key/address value of an IPNS route.
 *
 * It will return return an object with some useful properties about the address
 *
 * @example
 *
 * http://<key>.ipns.<host>/*
 * http://<host>/ipns/<key>/*
 */
export declare function getIpnsAddressDetails(address: string): IpnsAddressDetails;
export {};
//# sourceMappingURL=ipns-address-utils.d.ts.map