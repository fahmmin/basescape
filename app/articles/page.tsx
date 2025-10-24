'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimationBackground } from '@/components/AnimationBackground';
import { ArticleCard } from '@/components/ArticleCard';
import { FileText, Plus, Loader2 } from 'lucide-react';

interface Article {
    _id: string;
    title: string;
    thumbnailBlob: {
        blobId: string;
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

export default function ArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'new' | 'popular' | 'views'>('new');

    useEffect(() => {
        const fetchArticles = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/articles?sort=${sortBy}`);
                const data = await response.json();
                if (data.ok) {
                    setArticles(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch articles:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticles();
    }, [sortBy]);

    return (
        <div className="flex flex-col items-center w-full min-h-[600px] font-montreal">
            <AnimationBackground />

            <main className="w-full max-w-7xl px-4 py-8 mt-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <FileText size={48} className="text-[#97F0E5]" />
                        <h1 className="font-mondwest text-4xl md:text-6xl">
                            Articles
                        </h1>
                    </div>
                    <p className="text-center text-[#F7F7F7]/70 max-w-2xl mx-auto mb-6">
                        News, reports, and stories permanently stored on Walrus blockchain. Articles can impact hype scores of nearby locations with GOOD/BAD/WORSE effects.
                    </p>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Sort Controls */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setSortBy('new')}
                                className={`px-6 py-2 rounded-md font-neuebit transition-all ${sortBy === 'new'
                                    ? 'bg-[#97F0E5] text-[#0C0F1D]'
                                    : 'bg-[#97F0E5]/20 text-[#F7F7F7] hover:bg-[#97F0E5]/40'
                                    }`}
                            >
                                NEWEST
                            </button>
                            <button
                                onClick={() => setSortBy('popular')}
                                className={`px-6 py-2 rounded-md font-neuebit transition-all ${sortBy === 'popular'
                                    ? 'bg-[#C684F6] text-[#0C0F1D]'
                                    : 'bg-[#C684F6]/20 text-[#F7F7F7] hover:bg-[#C684F6]/40'
                                    }`}
                            >
                                POPULAR
                            </button>
                            <button
                                onClick={() => setSortBy('views')}
                                className={`px-6 py-2 rounded-md font-neuebit transition-all ${sortBy === 'views'
                                    ? 'bg-[#FFA500] text-[#0C0F1D]'
                                    : 'bg-[#FFA500]/20 text-[#F7F7F7] hover:bg-[#FFA500]/40'
                                    }`}
                            >
                                VIEWS
                            </button>
                        </div>

                        {/* Create Button */}
                        <Link href="/articles/create">
                            <button className="flex items-center gap-2 px-6 py-2 bg-[#97F0E5] hover:bg-[#97F0E5]/80 text-[#0C0F1D] rounded-md font-neuebit transition-all">
                                <Plus size={20} />
                                <span>CREATE ARTICLE</span>
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={48} className="text-[#97F0E5] animate-spin mb-4" />
                        <p className="text-[#F7F7F7]/70">Loading articles...</p>
                    </div>
                ) : articles.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-20">
                        <FileText size={64} className="text-[#F7F7F7]/30 mb-4" />
                        <p className="text-[#F7F7F7]/70 text-xl mb-4">No articles yet</p>
                        <p className="text-[#F7F7F7]/50 mb-6">
                            Be the first to share a story and impact location hype scores!
                        </p>
                        <Link href="/articles/create">
                            <button className="flex items-center gap-2 px-6 py-3 bg-[#97F0E5] hover:bg-[#97F0E5]/80 text-[#0C0F1D] rounded-md font-neuebit transition-all">
                                <Plus size={20} />
                                <span>CREATE FIRST ARTICLE</span>
                            </button>
                        </Link>
                    </div>
                ) : (
                    /* Articles Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article) => (
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
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

