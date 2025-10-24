'use client';

import { useState, useEffect } from 'react';
import { Database, Copy, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner';

interface WalrusMetadata {
    blobId: string;
    url: string;
    certificateId?: string;
    contentHash?: string;
    epochs?: number;
    publisherUrl?: string;
    aggregatorUrl?: string;
    suiObjectId?: string;
    endEpoch?: number;
}

interface WalrusBadgeProps {
    dropId: string;
}

export function WalrusBadge({ dropId }: WalrusBadgeProps) {
    const [metadata, setMetadata] = useState<WalrusMetadata | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const response = await fetch(`/api/drops/${dropId}/walrus`);
                const data = await response.json();
                if (data.ok) {
                    setMetadata(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch Walrus metadata:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetadata();
    }, [dropId]);

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(label);
            toast.success(`${label} copied!`);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
            toast.error('Failed to copy');
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-lg">
                <p className="text-[#F7F7F7]/50">Loading Walrus metadata...</p>
            </div>
        );
    }

    if (!metadata) {
        return null;
    }

    return (
        <div className="p-6 bg-[#0C0F1D] border-2 border-[#97F0E5] rounded-lg space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Database size={24} className="text-[#97F0E5]" />
                <h3 className="font-mondwest text-xl text-[#F7F7F7]">
                    Walrus Storage Details
                </h3>
            </div>

            <div className="space-y-3">
                {/* Blob ID */}
                <div className="flex items-center justify-between p-3 bg-[#090e1d] rounded-md">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-neuebit text-[#F7F7F7]/70 mb-1">BLOB ID</p>
                        <p className="font-mono text-sm text-[#97F0E5] truncate">
                            {metadata.blobId}
                        </p>
                    </div>
                    <button
                        onClick={() => copyToClipboard(metadata.blobId, 'Blob ID')}
                        className="ml-2 p-2 hover:bg-[#97F0E5]/20 rounded-md transition-colors"
                    >
                        {copied === 'Blob ID' ? (
                            <Check size={16} className="text-[#97F0E5]" />
                        ) : (
                            <Copy size={16} className="text-[#F7F7F7]" />
                        )}
                    </button>
                </div>

                {/* Sui Object ID */}
                {metadata.suiObjectId && (
                    <div className="flex items-center justify-between p-3 bg-[#090e1d] rounded-md">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-neuebit text-[#F7F7F7]/70 mb-1">
                                SUI OBJECT ID
                            </p>
                            <p className="font-mono text-sm text-[#C684F6] truncate">
                                {metadata.suiObjectId}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => copyToClipboard(metadata.suiObjectId!, 'Sui Object ID')}
                                className="p-2 hover:bg-[#C684F6]/20 rounded-md transition-colors"
                            >
                                {copied === 'Sui Object ID' ? (
                                    <Check size={16} className="text-[#C684F6]" />
                                ) : (
                                    <Copy size={16} className="text-[#F7F7F7]" />
                                )}
                            </button>
                            <a
                                href={`https://suiscan.xyz/testnet/object/${metadata.suiObjectId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-[#C684F6]/20 rounded-md transition-colors"
                            >
                                <ExternalLink size={16} className="text-[#C684F6]" />
                            </a>
                        </div>
                    </div>
                )}

                {/* Storage Details */}
                <div className="grid grid-cols-2 gap-3">
                    {metadata.epochs !== undefined && (
                        <div className="p-3 bg-[#090e1d] rounded-md">
                            <p className="text-sm font-neuebit text-[#F7F7F7]/70 mb-1">
                                EPOCHS
                            </p>
                            <p className="text-lg font-neuebit text-[#97F0E5]">
                                {metadata.epochs}
                            </p>
                        </div>
                    )}
                    {metadata.endEpoch && (
                        <div className="p-3 bg-[#090e1d] rounded-md">
                            <p className="text-sm font-neuebit text-[#F7F7F7]/70 mb-1">
                                END EPOCH
                            </p>
                            <p className="text-lg font-neuebit text-[#97F0E5]">
                                {metadata.endEpoch}
                            </p>
                        </div>
                    )}
                </div>

                {/* URLs */}
                {metadata.aggregatorUrl && (
                    <div className="p-3 bg-[#090e1d] rounded-md">
                        <p className="text-sm font-neuebit text-[#F7F7F7]/70 mb-1">
                            AGGREGATOR URL
                        </p>
                        <div className="flex items-center gap-2">
                            <p className="font-mono text-xs text-[#F7F7F7] truncate flex-1">
                                {metadata.aggregatorUrl}
                            </p>
                            <a
                                href={metadata.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-[#97F0E5]/20 rounded-md transition-colors"
                            >
                                <ExternalLink size={16} className="text-[#97F0E5]" />
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

