'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@/lib/walletContext';
import { AnimationBackground } from '@/components/AnimationBackground';
import { DropCard } from '@/components/DropCard';
import { ArticleCard } from '@/components/ArticleCard';
import { User, Heart, FileText, Flame, Loader2, Activity } from 'lucide-react';

interface Drop {
    _id: string;
    title: string;
    city: string;
    country: string;
    media: {
        url: string;
    };
    voteCount: number;
    uniqueCommenters: number;
    hypeScore: number;
    createdAt: string;
}

interface Article {
    _id: string;
    title: string;
    thumbnailBlob: {
        url: string;
    };
    impactTag: 'good' | 'bad' | 'worse';
    linkedLocation?: {
        city?: string;
        country?: string;
    };
    verifyCount: number;
    viewCount: number;
    createdAt: string;
}

interface ProfileData {
    wallet: string;
    drops: Drop[];
    articles: Article[];
    stats: {
        totalDrops: number;
        totalArticles: number;
        totalVotes: number;
        totalArticleVerifies: number;
        totalHype: number;
    };
}

export default function ProfilePage() {
    const account = useCurrentAccount();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'drops' | 'articles' | 'activity'>('drops');
    const [friendActivity, setFriendActivity] = useState<Array<(Drop | Article) & { type: string }>>([]);

    useEffect(() => {
        const loadData = async () => {
            if (account) {
                await Promise.all([fetchProfile(), fetchFriendActivity()]);
            } else {
                setIsLoading(false);
            }
        };

        loadData();
    }, [account]);

    const fetchProfile = async () => {
        if (!account) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/profile/${account.address}`);
            const data = await response.json();
            if (data.ok) {
                setProfile(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFriendActivity = async () => {
        if (!account) return;

        try {
            const response = await fetch(`/api/activity/friends?wallet=${account.address}`);
            const data = await response.json();
            if (data.ok) {
                setFriendActivity(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch friend activity:', error);
        }
    };

    if (!account) {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-[600px]">
                <AnimationBackground />
                <User size={64} className="text-[#F7F7F7]/30 mb-4" />
                <p className="text-[#F7F7F7]/70 text-xl">Connect your wallet to view profile</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-[600px]">
                <AnimationBackground />
                <Loader2 size={48} className="text-[#97F0E5] animate-spin mb-4" />
                <p className="text-[#F7F7F7]/70">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full min-h-[600px] font-montreal">
            <AnimationBackground />

            <main className="w-full max-w-7xl px-4 py-8 mt-8">
                {/* Profile Header */}
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <User size={48} className="text-[#97F0E5]" />
                        <h1 className="font-mondwest text-4xl md:text-6xl">My Profile</h1>
                    </div>
                    <p className="font-mono text-[#F7F7F7]/70">
                        {account.address.slice(0, 12)}...{account.address.slice(-8)}
                    </p>
                </div>

                {/* Stats Grid */}
                {profile && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <div className="p-4 bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-lg text-center">
                            <FileText size={24} className="mx-auto mb-2 text-[#97F0E5]" />
                            <p className="text-2xl font-neuebit text-[#F7F7F7]">
                                {profile.stats.totalDrops}
                            </p>
                            <p className="text-sm text-[#F7F7F7]/50">Drops</p>
                        </div>
                        <div className="p-4 bg-[#0C0F1D] border-2 border-[#C684F6]/30 rounded-lg text-center">
                            <FileText size={24} className="mx-auto mb-2 text-[#C684F6]" />
                            <p className="text-2xl font-neuebit text-[#F7F7F7]">
                                {profile.stats.totalArticles}
                            </p>
                            <p className="text-sm text-[#F7F7F7]/50">Articles</p>
                        </div>
                        <div className="p-4 bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-lg text-center">
                            <Heart size={24} className="mx-auto mb-2 text-[#97F0E5]" />
                            <p className="text-2xl font-neuebit text-[#F7F7F7]">
                                {profile.stats.totalVotes + profile.stats.totalArticleVerifies}
                            </p>
                            <p className="text-sm text-[#F7F7F7]/50">Total Votes</p>
                        </div>
                        <div className="p-4 bg-[#0C0F1D] border-2 border-[#C684F6]/30 rounded-lg text-center">
                            <Flame size={24} className="mx-auto mb-2 text-[#C684F6]" />
                            <p className="text-2xl font-neuebit text-[#F7F7F7]">
                                {profile.stats.totalHype}
                            </p>
                            <p className="text-sm text-[#F7F7F7]/50">Total Hype</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex justify-center gap-4 mb-8 flex-wrap">
                    <button
                        onClick={() => setActiveTab('drops')}
                        className={`px-6 py-3 rounded-md font-neuebit transition-all ${activeTab === 'drops'
                            ? 'bg-[#97F0E5] text-[#0C0F1D]'
                            : 'bg-[#97F0E5]/20 text-[#F7F7F7] hover:bg-[#97F0E5]/40'
                            }`}
                    >
                        MY DROPS ({profile?.stats.totalDrops || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('articles')}
                        className={`px-6 py-3 rounded-md font-neuebit transition-all ${activeTab === 'articles'
                            ? 'bg-[#C684F6] text-[#0C0F1D]'
                            : 'bg-[#C684F6]/20 text-[#F7F7F7] hover:bg-[#C684F6]/40'
                            }`}
                    >
                        MY ARTICLES ({profile?.stats.totalArticles || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`px-6 py-3 rounded-md font-neuebit transition-all ${activeTab === 'activity'
                            ? 'bg-[#FFA500] text-[#0C0F1D]'
                            : 'bg-[#FFA500]/20 text-[#F7F7F7] hover:bg-[#FFA500]/40'
                            }`}
                    >
                        FRIENDS ACTIVITY
                    </button>
                </div>

                {/* Content */}
                {profile && (
                    <>
                        {activeTab === 'drops' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {profile.drops.length === 0 ? (
                                    <div className="col-span-full text-center py-12 text-[#F7F7F7]/50">
                                        No drops yet. Create your first one!
                                    </div>
                                ) : (
                                    profile.drops.map((drop) => (
                                        <DropCard
                                            key={drop._id}
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
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'articles' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {profile.articles.length === 0 ? (
                                    <div className="col-span-full text-center py-12 text-[#F7F7F7]/50">
                                        No articles yet. Create your first one!
                                    </div>
                                ) : (
                                    profile.articles.map((article) => (
                                        <ArticleCard
                                            key={article._id}
                                            id={article._id}
                                            title={article.title}
                                            thumbnailUrl={article.thumbnailBlob.url}
                                            impactTag={article.impactTag}
                                            linkedLocation={article.linkedLocation}
                                            verifyCount={article.verifyCount}
                                            viewCount={article.viewCount}
                                            createdAt={article.createdAt}
                                        />
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Activity size={24} className="text-[#FFA500]" />
                                    <h2 className="font-neuebit text-xl text-[#F7F7F7]">
                                        Friends Activity Feed
                                    </h2>
                                </div>
                                {friendActivity.length === 0 ? (
                                    <div className="text-center py-12 text-[#F7F7F7]/50">
                                        No friend activity yet. Add some friends to see their drops & articles!
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {friendActivity.map((item) => {
                                            if (item.type === 'drop') {
                                                const drop = item as Drop & { type: string };
                                                return (
                                                    <DropCard
                                                        key={drop._id}
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
                                                );
                                            } else {
                                                const article = item as Article & { type: string };
                                                return (
                                                    <ArticleCard
                                                        key={article._id}
                                                        id={article._id}
                                                        title={article.title}
                                                        thumbnailUrl={article.thumbnailBlob.url}
                                                        impactTag={article.impactTag}
                                                        linkedLocation={article.linkedLocation}
                                                        verifyCount={article.verifyCount}
                                                        viewCount={article.viewCount}
                                                        createdAt={article.createdAt}
                                                    />
                                                );
                                            }
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

