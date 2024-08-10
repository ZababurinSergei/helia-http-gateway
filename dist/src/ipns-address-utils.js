import { peerIdFromString } from '@libp2p/peer-id';
import { CID } from 'multiformats/cid';
const HAS_UPPERCASE_REGEX = /[A-Z]/;
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
export function getIpnsAddressDetails(address) {
    let cid = null;
    let peerId = null;
    if (HAS_UPPERCASE_REGEX.test(address)) {
        try {
            // could be CIDv0 or PeerId at this point.
            cid = CID.parse(address).toV1();
        }
        catch {
            // ignore
        }
        try {
            peerId = peerIdFromString(address);
        }
        catch {
            // ignore error
        }
    }
    return {
        peerId,
        cid
    };
}
//# sourceMappingURL=ipns-address-utils.js.map