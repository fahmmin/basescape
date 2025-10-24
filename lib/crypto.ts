import { keccak256, stringToBytes } from 'viem';

/**
 * Generate a unique hash for voting that preserves anonymity
 * Uses wallet address, postId, and server salt
 */
export function voteHash({
    wallet,
    postId,
    serverSalt,
}: {
    wallet: string;
    postId: string;
    serverSalt: string;
}): string {
    return keccak256(
        stringToBytes(`${wallet.toLowerCase()}|${postId}|${serverSalt}`)
    );
}

/**
 * Generate message for signature verification
 */
export function messageFor(action: 'create' | 'vote', postId?: string): string {
    return action === 'create' ? 'create:culturedrop' : `vote:${postId}`;
}

