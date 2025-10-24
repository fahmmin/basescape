'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Sparkles, DollarSign } from 'lucide-react';
import { getBaseExplorerUrl, weiToETH } from '@/lib/baseContract';

interface NFTBadgeProps {
    nftData: {
        tokenId: number;
        mintedAt: string | Date;
        mintedBy: string;
        txHash: string;
    };
}

interface NFTOnChainData {
    basePrice: number;
    currentPrice: number;
    forSale: boolean;
    evolutionLevel: number;
    hypeScore: number;
}

export function NFTBadge({ nftData }: NFTBadgeProps) {
    const { tokenId, mintedBy, txHash } = nftData;
    const [onChainData, setOnChainData] = useState<NFTOnChainData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNFTData = async () => {
            try {
                const response = await fetch(`/api/nft/${tokenId}`);
                const data = await response.json();
                if (data.ok) {
                    setOnChainData({
                        basePrice: Number(data.data.basePrice),
                        currentPrice: Number(data.data.currentPrice),
                        forSale: data.data.forSale,
                        evolutionLevel: Number(data.data.evolutionLevel),
                        hypeScore: Number(data.data.hypeScore),
                    });
                }
            } catch (error) {
                console.error('Failed to fetch NFT on-chain data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNFTData();
    }, [tokenId]);

    return (
        <div className="p-6 bg-gradient-to-br from-[#C684F6]/20 to-[#97F0E5]/20 border-2 border-[#C684F6] rounded-lg space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <Sparkles size={28} className="text-[#C684F6]" />
                <h3 className="font-mondwest text-2xl text-[#F7F7F7]">
                    Minted as NFT
                </h3>
            </div>

            <div className="space-y-3">
                {/* NFT Token ID */}
                <div className="p-3 bg-[#0C0F1D] rounded-md">
                    <p className="text-sm font-neuebit text-[#F7F7F7]/70 mb-1">
                        NFT TOKEN ID
                    </p>
                    <div className="flex items-center justify-between">
                        <p className="font-mono text-sm text-[#C684F6]">
                            #{tokenId}
                        </p>
                        <a
                            href={getBaseExplorerUrl(`0x5Dc29E2Fd687547048D9A5466513f8269e85b777`)} // BaseScape contract
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-[#C684F6]/20 rounded-md transition-colors"
                        >
                            <ExternalLink size={16} className="text-[#C684F6]" />
                        </a>
                    </div>
                </div>

                {/* Transaction */}
                <div className="p-3 bg-[#0C0F1D] rounded-md">
                    <p className="text-sm font-neuebit text-[#F7F7F7]/70 mb-1">
                        MINT TRANSACTION
                    </p>
                    <div className="flex items-center justify-between">
                        <p className="font-mono text-sm text-[#97F0E5]">
                            {txHash.slice(0, 8)}...{txHash.slice(-6)}
                        </p>
                        <a
                            href={getBaseExplorerUrl(txHash, 'tx')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-[#97F0E5]/20 rounded-md transition-colors"
                        >
                            <ExternalLink size={16} className="text-[#97F0E5]" />
                        </a>
                    </div>
                </div>

                {/* Minted By */}
                <div className="p-3 bg-[#0C0F1D] rounded-md">
                    <p className="text-sm font-neuebit text-[#F7F7F7]/70 mb-1">
                        MINTED BY
                    </p>
                    <p className="font-mono text-sm text-[#F7F7F7]">
                        {mintedBy.slice(0, 12)}...{mintedBy.slice(-8)}
                    </p>
                </div>

                {/* Marketplace Info */}
                {!isLoading && onChainData && (
                    <>
                        {onChainData.forSale ? (
                            <div className="p-4 bg-gradient-to-r from-[#C684F6]/20 to-[#97F0E5]/20 border-2 border-[#C684F6] rounded-md">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign size={20} className="text-[#C684F6]" />
                                    <span className="font-neuebit text-lg text-[#C684F6]">
                                        FOR SALE
                                    </span>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p className="text-[#F7F7F7]/70">
                                        Base Price: <span className="text-[#97F0E5] font-neuebit">{weiToETH(BigInt(onChainData.basePrice)).toFixed(4)} ETH</span>
                                    </p>
                                    <p className="text-[#F7F7F7]">
                                        Current Price: <span className="text-[#C684F6] font-neuebit text-lg">{weiToETH(BigInt(onChainData.currentPrice)).toFixed(4)} ETH</span>
                                    </p>
                                    <p className="text-xs text-[#F7F7F7]/50">
                                        {((onChainData.currentPrice / Math.max(onChainData.basePrice, 1) - 1) * 100).toFixed(0)}% hype bonus applied
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-3 bg-[#0C0F1D] border-2 border-[#97F0E5]/20 rounded-md text-center">
                                <p className="text-sm text-[#F7F7F7]/70">
                                    Not currently for sale
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* Info */}
                <div className="p-3 bg-[#C684F6]/10 rounded-md">
                    <p className="text-xs text-[#F7F7F7]/70 leading-relaxed">
                        ✨ This drop is now a permanent NFT on Base blockchain!
                        Built on Ethereum L2, you can view it in your wallet, transfer it, or trade it.
                    </p>
                </div>
            </div>
        </div>
    );
}

