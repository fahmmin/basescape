/**
 * Base Blockchain Contract Integration
 * Culture Drops NFT Contract for Base Sepolia
 */

import { ethers } from 'ethers';

// Base Sepolia Contract Address
export const BASESCAPE_CONTRACT_ADDRESS = '0x5Dc29E2Fd687547048D9A5466513f8269e85b777'; // BaseScape NFT contract on Base Sepolia

// Base Sepolia Network Configuration
export const BASE_SEPOLIA_CONFIG = {
    chainId: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
    },
};

// BaseScape NFT Contract ABI (minimal for the functions we need)
export const BASESCAPE_NFT_ABI = [
    // Mint function
    'function mintDrop(string memory title, string memory caption, string memory city, string memory country, string memory blobId, string memory imageUrl, string memory dropId, string memory longitude, string memory latitude, uint256 hypeScore, uint256 voteCount, uint256 commentCount, uint256 basePrice, address creatorWallet) external',

    // Buy function
    'function buyNFT(uint256 tokenId) external payable',

    // List for sale
    'function listForSale(uint256 tokenId, uint256 basePrice) external',

    // Delist
    'function delist(uint256 tokenId) external',

    // Evolve
    'function evolve(uint256 tokenId, uint256 newHypeScore) external',

    // View functions
    'function getCultureDropData(uint256 tokenId) external view returns (tuple(string title, string caption, string city, string country, string blobId, string imageUrl, string dropId, string longitude, string latitude, uint256 hypeScore, uint256 voteCount, uint256 commentCount, uint8 evolutionLevel, address creator, uint256 mintedAt, uint256 basePrice, uint256 currentPrice, bool forSale, uint256 hypeMultiplier))',
    'function totalSupply() external view returns (uint256)',
    'function ownerOf(uint256 tokenId) external view returns (address)',
    'function calculateEvolutionLevel(uint256 hypeScore) external pure returns (uint8)',
    'function calculateHypeMultiplier(uint256 hypeScore) external pure returns (uint256)',

    // Events
    'event DropNFTMinted(uint256 indexed tokenId, string dropId, string title, string blobId, address indexed creator, address indexed owner, uint256 hypeScore)',
    'event NFTEvolved(uint256 indexed tokenId, uint8 oldLevel, uint8 newLevel, uint256 hypeScore)',
    'event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 basePrice, uint256 currentPrice, uint256 hypeMultiplier)',
    'event NFTPurchased(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price, uint256 hypeScore)',
    'event NFTDelisted(uint256 indexed tokenId, address indexed owner)',
] as const;

/**
 * Get Base Sepolia provider
 */
export function getBaseSepoliaProvider(): ethers.JsonRpcProvider {
    return new ethers.JsonRpcProvider(BASE_SEPOLIA_CONFIG.rpcUrl);
}

/**
 * Get BaseScape NFT contract instance
 */
export function getBaseScapeContract(signer?: ethers.Signer): ethers.Contract {
    const provider = signer ? signer.provider! : getBaseSepoliaProvider();
    return new ethers.Contract(
        BASESCAPE_CONTRACT_ADDRESS,
        BASESCAPE_NFT_ABI,
        signer || provider
    );
}

/**
 * Mint a Culture Drop NFT
 */
export async function mintDropNFT(
    signer: ethers.Signer,
    dropData: {
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
        basePrice: number; // Price in ETH
        creatorWallet: string;
    }
): Promise<{ tx: ethers.ContractTransactionResponse; tokenId: number }> {
    const contract = getBaseScapeContract(signer);

    // Convert ETH to wei
    const basePriceInWei = ethers.parseEther(dropData.basePrice.toString());

    const tx = await contract.mintDrop(
        dropData.title,
        dropData.caption,
        dropData.city,
        dropData.country,
        dropData.blobId,
        dropData.imageUrl,
        dropData.dropId,
        dropData.longitude.toString(),
        dropData.latitude.toString(),
        Math.floor(dropData.hypeScore),
        dropData.voteCount,
        dropData.commentCount || 0,
        basePriceInWei,
        dropData.creatorWallet
    );

    // Wait for transaction and get token ID from events
    const receipt = await tx.wait();
    const tokenId = await extractTokenIdFromReceipt(receipt!);

    return { tx, tokenId };
}

/**
 * Buy an NFT
 */
export async function buyNFT(
    signer: ethers.Signer,
    tokenId: number,
    priceInETH: number
): Promise<ethers.ContractTransactionResponse> {
    const contract = getBaseScapeContract(signer);
    const priceInWei = ethers.parseEther(priceInETH.toString());

    return await contract.buyNFT(tokenId, { value: priceInWei });
}

/**
 * List NFT for sale
 */
export async function listNFTForSale(
    signer: ethers.Signer,
    tokenId: number,
    basePriceInETH: number
): Promise<ethers.ContractTransactionResponse> {
    const contract = getBaseScapeContract(signer);
    const basePriceInWei = ethers.parseEther(basePriceInETH.toString());

    return await contract.listForSale(tokenId, basePriceInWei);
}

/**
 * Delist NFT
 */
export async function delistNFT(
    signer: ethers.Signer,
    tokenId: number
): Promise<ethers.ContractTransactionResponse> {
    const contract = getBaseScapeContract(signer);
    return await contract.delist(tokenId);
}

/**
 * Evolve NFT
 */
export async function evolveNFT(
    signer: ethers.Signer,
    tokenId: number,
    newHypeScore: number
): Promise<ethers.ContractTransactionResponse> {
    const contract = getBaseScapeContract(signer);
    return await contract.evolve(tokenId, Math.floor(newHypeScore));
}

/**
 * Get NFT data
 */
export async function getNFTData(tokenId: number): Promise<{
    title: string;
    caption: string;
    city: string;
    country: string;
    blobId: string;
    imageUrl: string;
    dropId: string;
    longitude: string;
    latitude: string;
    hypeScore: bigint;
    voteCount: bigint;
    commentCount: bigint;
    evolutionLevel: number;
    creator: string;
    mintedAt: bigint;
    basePrice: bigint;
    currentPrice: bigint;
    forSale: boolean;
    hypeMultiplier: bigint;
}> {
    const contract = getBaseScapeContract();
    return await contract.getCultureDropData(tokenId);
}

/**
 * Get total supply
 */
export async function getTotalSupply(): Promise<number> {
    const contract = getBaseScapeContract();
    const supply = await contract.totalSupply();
    return Number(supply);
}

/**
 * Get NFT owner
 */
export async function getNFTOwner(tokenId: number): Promise<string> {
    const contract = getBaseScapeContract();
    return await contract.ownerOf(tokenId);
}

/**
 * Calculate evolution level
 */
export async function calculateEvolutionLevel(hypeScore: number): Promise<number> {
    const contract = getBaseScapeContract();
    const level = await contract.calculateEvolutionLevel(Math.floor(hypeScore));
    return Number(level);
}

/**
 * Calculate hype multiplier
 */
export async function calculateHypeMultiplier(hypeScore: number): Promise<number> {
    const contract = getBaseScapeContract();
    const multiplier = await contract.calculateHypeMultiplier(Math.floor(hypeScore));
    return Number(multiplier);
}

/**
 * Extract token ID from transaction receipt
 */
async function extractTokenIdFromReceipt(receipt: ethers.TransactionReceipt): Promise<number> {
    const contract = getBaseScapeContract();

    // Look for DropNFTMinted event
    for (const log of receipt.logs) {
        try {
            const parsed = contract.interface.parseLog({
                topics: log.topics,
                data: log.data,
            });

            if (parsed && parsed.name === 'DropNFTMinted') {
                return Number(parsed.args.tokenId);
            }
        } catch {
            // Continue to next log
        }
    }

    throw new Error('Could not extract token ID from transaction receipt');
}

/**
 * Get Base explorer URL
 */
export function getBaseExplorerUrl(txHash: string, type: 'tx' | 'address' = 'tx'): string {
    return `${BASE_SEPOLIA_CONFIG.blockExplorer}/${type}/${txHash}`;
}

/**
 * Convert wei to ETH
 */
export function weiToETH(wei: bigint): number {
    return Number(ethers.formatEther(wei));
}

/**
 * Convert ETH to wei
 */
export function ethToWei(eth: number): bigint {
    return ethers.parseEther(eth.toString());
}

/**
 * Calculate current NFT price based on hype
 * Uses same formula as contract
 */
export function calculateCurrentPrice(basePriceInETH: number, hypeScore: number): number {
    // Calculate multiplier (1000 = 1.0x)
    const base = 1000;
    const bonus = Math.floor(hypeScore / 10) * 100;
    const multiplier = Math.min(base + bonus, 5000);

    // Apply multiplier
    return (basePriceInETH * multiplier) / 1000;
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

/**
 * Format price for display
 */
export function formatPrice(priceInWei: bigint): string {
    const eth = weiToETH(priceInWei);
    return `${eth.toFixed(4)} ETH`;
}

/**
 * Check if wallet is connected to Base Sepolia
 */
export async function checkBaseSepoliaConnection(provider: ethers.Provider): Promise<boolean> {
    try {
        const network = await provider.getNetwork();
        return Number(network.chainId) === BASE_SEPOLIA_CONFIG.chainId;
    } catch {
        return false;
    }
}

/**
 * Add Base Sepolia to wallet (MetaMask)
 */
export async function addBaseSepoliaToWallet(): Promise<void> {
    if (typeof window !== 'undefined' && window.ethereum) {
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [BASE_SEPOLIA_CONFIG],
            });
        } catch (error) {
            console.error('Error adding Base Sepolia to wallet:', error);
            throw error;
        }
    } else {
        throw new Error('MetaMask not detected');
    }
}
