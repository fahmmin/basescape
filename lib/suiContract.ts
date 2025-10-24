/**
 * Sui Contract Integration
 * Custom Culture Drops NFT Contract
 */

import { Transaction } from '@mysten/sui/transactions';

// Culture Drops NFT Contract (Custom - Option A with Marketplace + Creator-Only Minting)
export const CULTURE_DROPS_PACKAGE_ID = '0x511b8e55f6072e2cfae0873157cf10d9494c7379e1bbcf2be6dadf6a97a8b128';
export const CULTURE_DROPS_DISPLAY_ID = '0xb1ed4768680638878cff309663584a89e4265f79441b2a0b6135b2f531c6fb4f';
export const CULTURE_DROPS_PUBLISHER_ID = '0xd5b968f6e50ac94cd68f37d8a9d48fbc219a4dd0f433d99e3e77217f44e9005a';

/**
 * Build transaction to mint a Culture Drop as custom NFT
 * 
 * @param dropData - Full drop data from MongoDB
 * @returns Transaction to be signed and executed
 */
export function buildMintDropNFTTransaction(dropData: {
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
    basePrice: number; // Price in SUI (will convert to MIST)
    creatorWallet: string; // Drop creator's wallet address
}): Transaction {
    const tx = new Transaction();

    // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
    const basePriceInMist = Math.floor(dropData.basePrice * 1_000_000_000);

    // Call culture_drops::nft::mint_drop with all metadata
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
            tx.pure.u64(basePriceInMist), // Base price in MIST
            tx.pure.address(dropData.creatorWallet), // Creator wallet address
        ],
    });

    return tx;
}

/**
 * Build transaction to buy an NFT
 */
export function buildBuyNFTTransaction(
    nftObjectId: string,
    priceInSUI: number
): Transaction {
    const tx = new Transaction();

    // Convert SUI to MIST
    const priceInMist = Math.floor(priceInSUI * 1_000_000_000);

    // Split coin from gas for payment
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(priceInMist)]);

    // Call buy_nft
    tx.moveCall({
        target: `${CULTURE_DROPS_PACKAGE_ID}::nft::buy_nft`,
        arguments: [
            tx.object(nftObjectId),
            coin,
        ],
    });

    return tx;
}

/**
 * Build transaction to list NFT for sale
 */
export function buildListNFTTransaction(
    nftObjectId: string,
    basePriceInSUI: number
): Transaction {
    const tx = new Transaction();

    const basePriceInMist = Math.floor(basePriceInSUI * 1_000_000_000);

    tx.moveCall({
        target: `${CULTURE_DROPS_PACKAGE_ID}::nft::list_for_sale`,
        arguments: [
            tx.object(nftObjectId),
            tx.pure.u64(basePriceInMist),
        ],
    });

    return tx;
}

/**
 * Build transaction to delist NFT
 */
export function buildDelistNFTTransaction(nftObjectId: string): Transaction {
    const tx = new Transaction();

    tx.moveCall({
        target: `${CULTURE_DROPS_PACKAGE_ID}::nft::delist`,
        arguments: [tx.object(nftObjectId)],
    });

    return tx;
}

/**
 * Extract NFT object ID from transaction result
 * Uses multiple fallback methods for reliability
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractNFTObjectId(result: any): string | null {
    console.log('🔍 Extracting Culture Drop NFT from transaction result:', JSON.stringify(result, null, 2));

    try {
        // METHOD 1: Check objectChanges for CultureDropNFT (most reliable)
        if (result.objectChanges) {
            console.log('📦 Checking objectChanges...');
            for (const change of result.objectChanges) {
                if (
                    change.type === 'created' &&
                    change.objectType?.includes('CultureDropNFT')
                ) {
                    console.log('✅ Found CultureDropNFT in objectChanges:', change.objectId);
                    return change.objectId;
                }
            }
            // Fallback: Check for Card (if using old contract)
            for (const change of result.objectChanges) {
                if (change.type === 'created' && change.objectType?.includes('Card')) {
                    console.log('✅ Found Card in objectChanges:', change.objectId);
                    return change.objectId;
                }
            }
        }

        // METHOD 2: Check events for DropNFTMinted
        if (result.events) {
            console.log('📡 Checking events...');
            for (const event of result.events) {
                if (event.type?.includes('DropNFTMinted')) {
                    const nftId = event.parsedJson?.nft_id;
                    if (nftId) {
                        console.log('✅ Found nft_id in DropNFTMinted event:', nftId);
                        return nftId;
                    }
                }
                // Fallback: CardCreated (old contract)
                if (event.type?.includes('CardCreated')) {
                    const cardId = event.parsedJson?.card_id;
                    if (cardId) {
                        console.log('✅ Found card_id in CardCreated event:', cardId);
                        return cardId;
                    }
                }
            }
        }

        // METHOD 3: Check effects.created (older SDK)
        if (result.effects?.created) {
            console.log('🔧 Checking effects.created...');
            const created = result.effects.created;
            if (created.length > 0) {
                const objectId = created[0].reference?.objectId || created[0].objectId;
                if (objectId) {
                    console.log('✅ Found in effects.created:', objectId);
                    return objectId;
                }
            }
        }

        // METHOD 4: Check digest and tell user to find manually
        if (result.digest) {
            console.log('⚠️ Could not auto-extract. Transaction digest:', result.digest);
            console.log('👉 User can find NFT manually on Suiscan using this transaction hash');
        }

        console.error('❌ All extraction methods failed. Full result:', result);
        return null;
    } catch (error) {
        console.error('💥 Error extracting NFT object ID:', error);
        return null;
    }
}

/**
 * Get Sui explorer URL for testnet
 */
export function getSuiExplorerUrl(objectId: string, type: 'object' | 'txn' = 'object'): string {
    const network = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';
    return `https://suiscan.xyz/${network}/${type}/${objectId}`;
}

/**
 * Calculate current NFT price based on hype
 * Uses same formula as contract
 */
export function calculateCurrentPrice(basePrice: number, hypeScore: number): number {
    // Calculate multiplier (1000 = 1.0x)
    const base = 1000;
    const bonus = Math.floor(hypeScore / 10) * 100;
    const multiplier = Math.min(base + bonus, 5000);

    // Apply multiplier
    return (basePrice * multiplier) / 1000;
}

/**
 * Convert MIST to SUI for display
 */
export function mistToSUI(mist: number): number {
    return mist / 1_000_000_000;
}

/**
 * Convert SUI to MIST for transactions
 */
export function suiToMIST(sui: number): number {
    return Math.floor(sui * 1_000_000_000);
}

