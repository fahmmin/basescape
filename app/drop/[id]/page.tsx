'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { AnimationBackground } from '@/components/AnimationBackground';
import { VoteButton } from '@/components/VoteButton';
import { CommentSection } from '@/components/CommentSection';
import { WalrusBadge } from '@/components/WalrusBadge';
import { NFTBadge } from '@/components/NFTBadge';
import { MapPin, Calendar, Loader2, Flame, Sparkles, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import {
    mintDropNFT,
    buyNFT,
    calculateCurrentPrice,
    weiToETH,
    BASESCAPE_CONTRACT_ADDRESS,
    getBaseSepoliaProvider
} from '@/lib/baseContract';

interface Drop {
    _id: string;
    title: string;
    caption: string;
    city: string;
    country: string;
    location?: {
        coordinates: [number, number];
    };
    media: {
        blobId: string;
        url: string;
    };
    voteCount: number;
    uniqueCommenters: number;
    hypeScore: number;
    createdAt: string;
    creatorWallet: string;
    nft?: {
        tokenId: number;
        contractAddress: string;
        mintedAt: string;
        mintedBy: string;
        txHash: string;
        isMinted: boolean;
    };
}

interface Comment {
    _id: string;
    pseudo: string;
    text: string;
    createdAt: string;
}

export default function DropDetailPage() {
    const params = useParams();
    const dropId = params.id as string;
    const [account, setAccount] = useState<string | null>(null);

    const [drop, setDrop] = useState<Drop | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMinting, setIsMinting] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualNftId, setManualNftId] = useState('');
    const [showPriceInput, setShowPriceInput] = useState(false);
    const [basePrice, setBasePrice] = useState('0');
    const [nftOnChainData, setNftOnChainData] = useState<{
        forSale: boolean;
        currentPrice: number;
        basePrice: number;
    } | null>(null);
    const [isBuying, setIsBuying] = useState(false);

    // Connect wallet
    const connectWallet = async () => {
        if (typeof window !== 'undefined' && window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send('eth_requestAccounts', []);
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                }
            } catch (error) {
                console.error('Failed to connect wallet:', error);
                toast.error('Failed to connect wallet');
            }
        } else {
            toast.error('Please install MetaMask');
        }
    };

    useEffect(() => {
        const fetchDrop = async () => {
            try {
                const response = await fetch(`/api/drops/${dropId}`);
                const data = await response.json();
                if (data.ok) {
                    setDrop(data.data.drop);
                    setComments(data.data.comments);

                    // Fetch NFT on-chain data if minted
                    if (data.data.drop.nft?.isMinted && data.data.drop.nft?.tokenId) {
                        fetchNFTData(data.data.drop.nft.tokenId);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch drop:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDrop();
    }, [dropId]);

    const fetchNFTData = async (tokenId: number) => {
        try {
            const response = await fetch(`/api/nft/${tokenId}`);
            const data = await response.json();
            if (data.ok) {
                setNftOnChainData({
                    forSale: data.data.forSale,
                    currentPrice: Number(data.data.currentPrice),
                    basePrice: Number(data.data.basePrice),
                });
            }
        } catch (error) {
            console.error('Failed to fetch NFT on-chain data:', error);
        }
    };

    const handleMintNFT = async () => {
        if (!account) {
            toast.error('Please connect your wallet first');
            return;
        }

        if (!drop) return;

        if (drop.nft?.isMinted) {
            toast.info('This drop is already minted as NFT');
            return;
        }

        setIsMinting(true);
        const toastId = toast.loading('Preparing NFT transaction...');

        try {
            // Verify user is the creator
            if (account.toLowerCase() !== drop.creatorWallet.toLowerCase()) {
                toast.error('Only the drop creator can mint this as an NFT');
                setIsMinting(false);
                return;
            }

            // Get signer
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            toast.loading('Sign transaction in your wallet...', { id: toastId });

            // Mint NFT using Base contract
            const { tx, tokenId } = await mintDropNFT(signer, {
                title: drop.title,
                caption: drop.caption,
                city: drop.city,
                country: drop.country,
                blobId: drop.media.blobId,
                imageUrl: drop.media.url,
                dropId: drop._id,
                longitude: drop.location?.coordinates[0] || 0,
                latitude: drop.location?.coordinates[1] || 0,
                hypeScore: drop.hypeScore,
                voteCount: drop.voteCount,
                commentCount: drop.uniqueCommenters,
                basePrice: parseFloat(basePrice) || 0, // Creator-set base price
                creatorWallet: drop.creatorWallet, // Pass creator wallet
            });

            console.log('✅ Transaction successful:', tx);

            toast.loading('NFT minted! Saving to database...', { id: toastId });

            // Save to MongoDB
            const saveResponse = await fetch(`/api/drops/${dropId}/mint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tokenId,
                    contractAddress: BASESCAPE_CONTRACT_ADDRESS,
                    txHash: tx.hash,
                    wallet: account,
                }),
            });

            const saveData = await saveResponse.json();

            if (saveData.ok) {
                toast.success('NFT minted successfully! 🎉', { id: toastId });

                // Update local state
                setDrop({
                    ...drop,
                    nft: saveData.data.nft,
                });
            } else {
                toast.error(saveData.error || 'Failed to save NFT data', { id: toastId });
            }
        } catch (error) {
            console.error('Error minting NFT:', error);
            toast.error(
                error instanceof Error ? error.message : 'Failed to mint NFT',
                { id: toastId }
            );
        } finally {
            setIsMinting(false);
        }
    };

    const handleManualNFTSave = async () => {
        if (!account || !drop || !manualNftId.trim()) return;

        try {
            const response = await fetch(`/api/drops/${dropId}/mint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tokenId: parseInt(manualNftId.trim()),
                    contractAddress: BASESCAPE_CONTRACT_ADDRESS,
                    txHash: 'MANUAL_ENTRY',
                    wallet: account,
                }),
            });

            const data = await response.json();

            if (data.ok) {
                toast.success('NFT data saved!');
                setDrop({
                    ...drop,
                    nft: data.data.nft,
                });
                setShowManualInput(false);
                setManualNftId('');
            } else {
                toast.error(data.error || 'Failed to save');
            }
        } catch (error) {
            console.error('Error saving manual NFT ID:', error);
            toast.error('Failed to save NFT ID');
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-[600px]">
                <AnimationBackground />
                <Loader2 size={48} className="text-[#97F0E5] animate-spin mb-4" />
                <p className="text-[#F7F7F7]/70">Loading drop...</p>
            </div>
        );
    }

    if (!drop) {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-[600px]">
                <AnimationBackground />
                <p className="text-[#F7F7F7]/70 text-xl">Drop not found</p>
            </div>
        );
    }

    const timeAgo = formatDistanceToNow(new Date(drop.createdAt), { addSuffix: true });

    return (
        <div className="flex flex-col items-center w-full min-h-[600px] font-montreal">
            <AnimationBackground />

            <main className="w-full max-w-6xl px-4 py-8 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Image */}
                    <div className="space-y-4">
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-[#97F0E5]">
                            <Image
                                src={drop.media.url}
                                alt={drop.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        {/* Walrus Badge */}
                        <WalrusBadge dropId={dropId} />

                        {/* NFT Badge - Show if minted */}
                        {drop.nft?.isMinted && (
                            <NFTBadge nftData={drop.nft} />
                        )}
                    </div>

                    {/* Right Column - Details */}
                    <div className="space-y-6">
                        {/* Header */}
                        <div>
                            <h1 className="font-mondwest text-3xl md:text-4xl mb-2">
                                {drop.title}
                            </h1>
                            <div className="flex items-center gap-2 text-[#F7F7F7]/70 mb-2">
                                <MapPin size={18} className="text-[#C684F6]" />
                                <span>{drop.city}, {drop.country}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#F7F7F7]/70 mb-4">
                                <Calendar size={18} className="text-[#97F0E5]" />
                                <span>{timeAgo}</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-[#C684F6]/20 border-2 border-[#C684F6] rounded-md">
                                <Flame size={20} className="text-[#C684F6]" />
                                <span className="font-neuebit text-[#C684F6]">
                                    HYPE SCORE: {drop.hypeScore.toFixed(1)}
                                </span>
                            </div>
                        </div>

                        {/* Caption */}
                        <div>
                            <h3 className="font-neuebit text-lg mb-2">ABOUT THIS PLACE</h3>
                            <p className="text-[#F7F7F7]/80 leading-relaxed">
                                {drop.caption}
                            </p>
                        </div>

                        {/* Vote Button */}
                        <VoteButton
                            dropId={dropId}
                            initialVoteCount={drop.voteCount}
                            onVoteSuccess={(newCount) => {
                                setDrop({ ...drop, voteCount: newCount });
                            }}
                        />

                        {/* Wallet Connection */}
                        {!account && (
                            <button
                                onClick={connectWallet}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md font-neuebit bg-gradient-to-r from-[#97F0E5] to-[#C684F6] hover:opacity-80 text-[#0C0F1D] transition-all"
                            >
                                <span>CONNECT WALLET</span>
                            </button>
                        )}

                        {account && (
                            <div className="p-3 bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-md">
                                <p className="text-sm font-neuebit text-[#F7F7F7]/70 mb-1">
                                    CONNECTED WALLET
                                </p>
                                <p className="font-mono text-sm text-[#97F0E5]">
                                    {account.slice(0, 8)}...{account.slice(-6)}
                                </p>
                            </div>
                        )}

                        {/* Buy NFT Button - Show to non-owners when for sale */}
                        {drop.nft?.isMinted && nftOnChainData?.forSale && account && account.toLowerCase() !== drop.creatorWallet.toLowerCase() && (
                            <button
                                onClick={async () => {
                                    if (!account) return;
                                    setIsBuying(true);
                                    const toastId = toast.loading('Preparing purchase...');

                                    try {
                                        const priceInETH = weiToETH(BigInt(nftOnChainData.currentPrice));
                                        const provider = new ethers.BrowserProvider(window.ethereum);
                                        const signer = await provider.getSigner();

                                        toast.loading('Sign purchase transaction...', { id: toastId });

                                        await buyNFT(signer, drop.nft!.tokenId, priceInETH);

                                        toast.success(`NFT purchased for ${priceInETH.toFixed(4)} ETH! 🎉`, { id: toastId });

                                        // Refresh NFT data
                                        fetchNFTData(drop.nft!.tokenId);
                                    } catch (error) {
                                        console.error('Purchase error:', error);
                                        toast.error('Failed to purchase NFT', { id: toastId });
                                    } finally {
                                        setIsBuying(false);
                                    }
                                }}
                                disabled={isBuying}
                                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-md font-neuebit text-lg transition-all ${isBuying
                                    ? 'bg-[#C684F6]/20 text-[#F7F7F7]/50 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#C684F6] to-[#97F0E5] hover:opacity-80 text-[#0C0F1D]'
                                    }`}
                            >
                                <DollarSign size={24} />
                                <span>
                                    {isBuying
                                        ? 'PURCHASING...'
                                        : `BUY NOW FOR ${weiToETH(BigInt(nftOnChainData.currentPrice)).toFixed(4)} ETH`}
                                </span>
                            </button>
                        )}

                        {/* Mint as NFT Button - Show only to creator */}
                        {!drop.nft?.isMinted && account && account.toLowerCase() === drop.creatorWallet.toLowerCase() && (
                            <div className="space-y-3">
                                {/* Price Setting */}
                                <div className="p-4 bg-[#0C0F1D] border-2 border-[#C684F6]/30 rounded-md space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={showPriceInput}
                                            onChange={(e) => setShowPriceInput(e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-neuebit text-[#F7F7F7]">
                                            List for sale after minting
                                        </span>
                                    </label>

                                    {showPriceInput && (
                                        <div className="pl-6 space-y-2">
                                            <label className="block text-sm text-[#F7F7F7]/70">
                                                Base Price (in ETH)
                                            </label>
                                            <input
                                                type="number"
                                                value={basePrice}
                                                onChange={(e) => setBasePrice(e.target.value)}
                                                step="0.1"
                                                min="0"
                                                placeholder="1.0"
                                                className="w-full p-2 bg-[#090e1d] border-2 border-[#C684F6]/30 rounded-md text-[#F7F7F7] focus:outline-none focus:border-[#C684F6]"
                                            />
                                            <p className="text-xs text-[#F7F7F7]/50">
                                                💡 Current hype: {drop.hypeScore.toFixed(1)} → Price will be{' '}
                                                <span className="text-[#C684F6] font-neuebit">
                                                    {calculateCurrentPrice(parseFloat(basePrice) || 0, drop.hypeScore).toFixed(4)} ETH
                                                </span>
                                                {' '}({((calculateCurrentPrice(1, drop.hypeScore) - 1) * 100).toFixed(0)}% hype bonus!)
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleMintNFT}
                                    disabled={isMinting || !account}
                                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md font-neuebit transition-all ${isMinting || !account
                                        ? 'bg-[#C684F6]/20 text-[#F7F7F7]/50 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-[#C684F6] to-[#97F0E5] hover:opacity-80 text-[#0C0F1D]'
                                        }`}
                                >
                                    <Sparkles size={20} />
                                    <span>
                                        {isMinting
                                            ? 'MINTING NFT...'
                                            : account
                                                ? 'MINT AS NFT ON BASE BLOCKCHAIN'
                                                : 'CONNECT WALLET TO MINT NFT'}
                                    </span>
                                </button>

                                {/* Manual NFT ID Input */}
                                <button
                                    onClick={() => setShowManualInput(!showManualInput)}
                                    className="w-full text-xs text-[#F7F7F7]/50 hover:text-[#97F0E5] transition-colors underline"
                                >
                                    {showManualInput ? 'Hide manual input' : 'Already minted? Enter NFT ID manually'}
                                </button>

                                {showManualInput && (
                                    <div className="p-4 bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-md space-y-2">
                                        <label className="block text-sm font-neuebit text-[#F7F7F7]/70">
                                            NFT Token ID (from BaseScan or wallet)
                                        </label>
                                        <input
                                            type="text"
                                            value={manualNftId}
                                            onChange={(e) => setManualNftId(e.target.value)}
                                            placeholder="123"
                                            className="w-full p-2 bg-[#090e1d] border-2 border-[#97F0E5]/30 rounded-md text-[#F7F7F7] font-mono text-sm focus:outline-none focus:border-[#97F0E5]"
                                        />
                                        <button
                                            onClick={handleManualNFTSave}
                                            disabled={!manualNftId.trim()}
                                            className="w-full px-4 py-2 bg-[#97F0E5] hover:bg-[#97F0E5]/80 text-[#0C0F1D] rounded-md font-neuebit transition-all disabled:opacity-50"
                                        >
                                            SAVE NFT ID
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Creator Info */}
                        <div className="p-4 bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-lg">
                            <p className="text-sm font-neuebit text-[#F7F7F7]/70 mb-1">
                                CREATED BY
                            </p>
                            <p className="font-mono text-sm text-[#97F0E5]">
                                {drop.creatorWallet.slice(0, 8)}...{drop.creatorWallet.slice(-6)}
                            </p>
                        </div>

                        {/* Comments Section */}
                        <CommentSection dropId={dropId} initialComments={comments} />
                    </div>
                </div>
            </main>
        </div>
    );
}

