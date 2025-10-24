'use client';

import { useState, useEffect } from 'react';
import { AnimationBackground } from '@/components/AnimationBackground';
import { DropCard } from '@/components/DropCard';
import { Trophy, Loader2 } from 'lucide-react';

interface CultureDrop {
    _id: string;
    title: string;
    caption: string;
    city: string;
    country: string;
    media: {
        blobId: string;
        url: string;
    };
    voteCount: number;
    uniqueCommenters: number;
    hypeScore: number;
    createdAt: string;
}

export default function LeaderboardPage() {
    const [drops, setDrops] = useState<CultureDrop[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRankings();
    }, []);

    const fetchRankings = async () => {
        try {
            const response = await fetch('/api/rankings');
            const data = await response.json();
            if (data.ok) {
                setDrops(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch rankings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full min-h-[600px] font-montreal">
            <AnimationBackground />

            <main className="w-full max-w-7xl px-4 py-8 mt-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Trophy size={48} className="text-[#C684F6]" />
                        <h1 className="font-mondwest text-4xl md:text-6xl">
                            Top Drops
                        </h1>
                    </div>
                    <p className="text-[#F7F7F7]/70 max-w-2xl mx-auto">
                        The highest-ranked culture drops based on community hype score. Votes, reviews, recency, and NFT rewards all contribute to the ranking algorithm.
                    </p>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={48} className="text-[#97F0E5] animate-spin mb-4" />
                        <p className="text-[#F7F7F7]/70">Loading rankings...</p>
                    </div>
                ) : drops.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <p className="text-[#F7F7F7]/70 text-xl mb-4">No drops yet</p>
                        <p className="text-[#F7F7F7]/50">Be the first to share a place and climb the leaderboard!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Podium - Top 3 */}
                        {drops.length >= 3 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {/* Second Place */}
                                <div className="order-2 md:order-1 relative">
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#C0C0C0] text-[#0C0F1D] w-12 h-12 rounded-full flex items-center justify-center font-mondwest text-xl border-2 border-[#97F0E5]">
                                        2
                                    </div>
                                    <div className="pt-8">
                                        <DropCard {...drops[1]} id={drops[1]._id} imageUrl={drops[1].media.url} />
                                    </div>
                                </div>

                                {/* First Place */}
                                <div className="order-1 md:order-2 relative scale-105">
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#FFD700] text-[#0C0F1D] w-14 h-14 rounded-full flex items-center justify-center font-mondwest text-2xl border-4 border-[#97F0E5]">
                                        1
                                    </div>
                                    <div className="pt-8">
                                        <DropCard {...drops[0]} id={drops[0]._id} imageUrl={drops[0].media.url} />
                                    </div>
                                </div>

                                {/* Third Place */}
                                <div className="order-3 relative">
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#CD7F32] text-[#0C0F1D] w-12 h-12 rounded-full flex items-center justify-center font-mondwest text-xl border-2 border-[#97F0E5]">
                                        3
                                    </div>
                                    <div className="pt-8">
                                        <DropCard {...drops[2]} id={drops[2]._id} imageUrl={drops[2].media.url} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Rest of the Rankings */}
                        {drops.length > 3 && (
                            <div>
                                <h2 className="font-neuebit text-2xl mb-6 text-center">
                                    RANKINGS #{4} - #{drops.length}
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {drops.slice(3).map((drop, index) => (
                                        <div key={drop._id} className="relative">
                                            <div className="absolute -top-2 -left-2 bg-[#97F0E5] text-[#0C0F1D] w-8 h-8 rounded-full flex items-center justify-center font-neuebit text-sm border-2 border-[#0C0F1D] z-10">
                                                {index + 4}
                                            </div>
                                            <DropCard
                                                id={drop._id}
                                                title={drop.title}
                                                city={drop.city}
                                                country={drop.country}
                                                imageUrl={drop.media.url}
                                                createdAt={drop.createdAt}
                                                voteCount={drop.voteCount}
                                                uniqueCommenters={drop.uniqueCommenters}
                                                hypeScore={drop.hypeScore}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

