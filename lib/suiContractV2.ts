/**
 * Sui Contract Integration V2
 * For Custom Culture Drops NFT Contract
 * 
 * Use this after deploying culture_drops_nft.move
 */

import { Transaction } from '@mysten/sui/transactions';

// AFTER DEPLOYMENT: Replace these with your actual IDs
export const CULTURE_DROPS_PACKAGE_ID = process.env.NEXT_PUBLIC_CULTURE_NFT_PACKAGE_ID || '';
export const CULTURE_DROPS_DISPLAY_ID = process.env.NEXT_PUBLIC_CULTURE_NFT_DISPLAY_ID || '';

/**
 * Build transaction to mint a Culture Drop as custom NFT
 * 
 * @param dropData - Full drop data from MongoDB
 * @returns Transaction to be signed and executed
 */
export function buildMintCultureDropNFT(dropData: {
    title: string;
    caption: string;
    city: string;
    country: string;
    blobId: string;
    imageUrl: string;
    dropId: string;
    longitude: number;
    latitude: number;
    hypeScore: number;
    voteCount: number;
    commentCount: number;
}): Transaction {
    const tx = new Transaction();

    // Call culture_drops::nft::mint_drop
    tx.moveCall({
        target: `${CULTURE_DROPS_PACKAGE_ID}::nft::mint_drop`,
        arguments: [
            tx.pure.string(dropData.title),
            tx.pure.string(dropData.caption),
            tx.pure.string(dropData.city),
            tx.pure.string(dropData.country),
            tx.pure.string(dropData.blobId),
            tx.pure.string(dropData.imageUrl),
            tx.pure.string(dropData.dropId),
            tx.pure.string(dropData.longitude.toString()),
            tx.pure.string(dropData.latitude.toString()),
            tx.pure.u64(Math.floor(dropData.hypeScore)),
            tx.pure.u64(dropData.voteCount),
            tx.pure.u64(dropData.commentCount || 0),
        ],
    });

    return tx;
}

/**
 * Build transaction to evolve NFT
 */
export function buildEvolveNFT(nftObjectId: string, newHypeScore: number): Transaction {
    const tx = new Transaction();

    tx.moveCall({
        target: `${CULTURE_DROPS_PACKAGE_ID}::nft::evolve`,
        arguments: [
            tx.object(nftObjectId),
            tx.pure.u64(Math.floor(newHypeScore)),
        ],
    });

    return tx;
}

/**
 * Extract NFT object ID from Culture Drops minting result
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractCultureDropNFTId(result: any): string | null {
    console.log('🔍 Extracting Culture Drop NFT from result:', JSON.stringify(result, null, 2));

    try {
        // METHOD 1: Check objectChanges (primary)
        if (result.objectChanges) {
            for (const change of result.objectChanges) {
                if (
                    change.type === 'created' &&
                    change.objectType?.includes('culture_drops') &&
                    change.objectType?.includes('CultureDropNFT')
                ) {
                    console.log('✅ Found CultureDropNFT in objectChanges:', change.objectId);
                    return change.objectId;
                }
            }
        }

        // METHOD 2: Check events for DropNFTMinted
        if (result.events) {
            for (const event of result.events) {
                if (event.type?.includes('DropNFTMinted')) {
                    const nftId = event.parsedJson?.nft_id;
                    if (nftId) {
                        console.log('✅ Found nft_id in DropNFTMinted event:', nftId);
                        return nftId;
                    }
                }
            }
        }

        // METHOD 3: Effects fallback
        if (result.effects?.created && result.effects.created.length > 0) {
            const objectId = result.effects.created[0].reference?.objectId || result.effects.created[0].objectId;
            if (objectId) {
                console.log('✅ Found in effects.created:', objectId);
                return objectId;
            }
        }

        console.error('❌ Could not extract NFT ID');
        return null;
    } catch (error) {
        console.error('💥 Error:', error);
        return null;
    }
}

/**
 * Get evolution level name
 */
export function getEvolutionLevelName(level: number): string {
    switch (level) {
        case 0: return 'Bronze';
        case 1: return 'Silver';
        case 2: return 'Gold';
        case 3: return 'Platinum';
        case 4: return 'Diamond';
        default: return 'Unknown';
    }
}

/**
 * Get evolution color
 */
export function getEvolutionColor(level: number): string {
    switch (level) {
        case 0: return '#CD7F32'; // Bronze
        case 1: return '#C0C0C0'; // Silver
        case 2: return '#FFD700'; // Gold
        case 3: return '#E5E4E2'; // Platinum
        case 4: return '#B9F2FF'; // Diamond
        default: return '#F7F7F7';
    }
}

/**
 * Calculate next evolution threshold
 */
export function getNextEvolutionThreshold(currentLevel: number): number {
    switch (currentLevel) {
        case 0: return 10;   // Bronze → Silver
        case 1: return 50;   // Silver → Gold
        case 2: return 100;  // Gold → Platinum
        case 3: return 500;  // Platinum → Diamond
        case 4: return Infinity; // Max level
        default: return Infinity;
    }
}

/**
 * Check if NFT can evolve
 */
export function canEvolve(currentLevel: number, currentHype: number): boolean {
    const threshold = getNextEvolutionThreshold(currentLevel);
    return currentHype >= threshold && currentLevel < 4;
}

