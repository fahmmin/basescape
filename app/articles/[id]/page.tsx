'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { AnimationBackground } from '@/components/AnimationBackground';
import { useCurrentAccount, useSignPersonalMessage } from '@mysten/dapp-kit';
import {
    FileText,
    Calendar,
    Eye,
    CheckCircle2,
    MapPin,
    Loader2,
    User,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { messageFor } from '@/lib/crypto';
import { getImpactColor, getImpactDescription } from '@/lib/hypeImpact';

interface Article {
    _id: string;
    title: string;
    author: string;
    thumbnailBlob: {
        url: string;
    };
    contentBlob: {
        url: string;
    };
    impactTag: 'good' | 'bad' | 'worse';
    linkedLocation?: {
        city?: string;
        country?: string;
        coordinates?: [number, number];
        radius?: number;
    };
    verifyCount: number;
    viewCount: number;
    createdAt: string;
}

export default function ArticleViewPage() {
    const params = useParams();
    const articleId = params.id as string;
    const account = useCurrentAccount();
    const { mutateAsync: signMessage } = useSignPersonalMessage();

    const [article, setArticle] = useState<Article | null>(null);
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingContent, setIsLoadingContent] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [hasVerified, setHasVerified] = useState(false);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const response = await fetch(`/api/articles/${articleId}`);
                const data = await response.json();
                if (data.ok) {
                    setArticle(data.data);
                    // Fetch content from Walrus blob
                    fetchContent(data.data.contentBlob.url);
                }
            } catch (error) {
                console.error('Failed to fetch article:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticle();
    }, [articleId]);

    const fetchContent = async (url: string) => {
        try {
            const response = await fetch(url);
            const text = await response.text();
            setContent(text);
        } catch (error) {
            console.error('Failed to fetch content:', error);
            setContent('Failed to load content from Walrus.');
        } finally {
            setIsLoadingContent(false);
        }
    };

    const handleVerify = async () => {
        if (!account) {
            toast.error('Please connect your wallet first');
            return;
        }

        if (hasVerified) {
            toast.info('You have already verified this article');
            return;
        }

        setIsVerifying(true);

        try {
            const message = messageFor('vote', articleId);
            const messageBytes = new TextEncoder().encode(message);
            const { signature } = await signMessage({ message: messageBytes });

            const response = await fetch(`/api/articles/${articleId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    signature,
                    wallet: account.address,
                }),
            });

            const data = await response.json();

            if (data.ok) {
                setArticle((prev) =>
                    prev
                        ? {
                            ...prev,
                            verifyCount: data.data.verifyCount,
                        }
                        : prev
                );
                setHasVerified(true);
                toast.success('Article verified! ✓');
            } else {
                if (data.error === 'Already verified this article') {
                    setHasVerified(true);
                }
                toast.error(data.error || 'Failed to verify');
            }
        } catch (error) {
            console.error('Verify error:', error);
            toast.error('Failed to verify article');
        } finally {
            setIsVerifying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-[600px]">
                <AnimationBackground />
                <Loader2 size={48} className="text-[#97F0E5] animate-spin mb-4" />
                <p className="text-[#F7F7F7]/70">Loading article...</p>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-[600px]">
                <AnimationBackground />
                <p className="text-[#F7F7F7]/70 text-xl">Article not found</p>
            </div>
        );
    }

    const timeAgo = formatDistanceToNow(new Date(article.createdAt), {
        addSuffix: true,
    });
    const tagColor = getImpactColor(article.impactTag);
    const tagDescription = getImpactDescription(article.impactTag);

    return (
        <div className="flex flex-col items-center w-full min-h-[600px] font-montreal">
            <AnimationBackground />

            <main className="w-full max-w-5xl px-4 py-8 mt-8">
                <article className="space-y-6">
                    {/* Header */}
                    <div className="space-y-4">
                        <h1 className="font-mondwest text-3xl md:text-5xl">
                            {article.title}
                        </h1>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[#F7F7F7]/70">
                            <div className="flex items-center gap-2">
                                <User size={16} />
                                <span className="font-mono">
                                    {article.author.slice(0, 6)}...{article.author.slice(-4)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                <span>{timeAgo}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye size={16} />
                                <span>{article.viewCount} views</span>
                            </div>
                        </div>

                        {/* Impact Tag */}
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-neuebit text-sm"
                            style={{
                                backgroundColor: `${tagColor}20`,
                                borderColor: tagColor,
                                color: tagColor,
                                border: '2px solid',
                            }}
                        >
                            <FileText size={16} />
                            <span>{article.impactTag.toUpperCase()}</span>
                            <span className="text-xs opacity-70">- {tagDescription}</span>
                        </div>

                        {/* Location */}
                        {article.linkedLocation?.city && article.linkedLocation?.country && (
                            <div className="flex items-center gap-2 text-[#C684F6]">
                                <MapPin size={18} />
                                <span>
                                    Linked to: {article.linkedLocation.city},{' '}
                                    {article.linkedLocation.country}
                                    {article.linkedLocation.radius &&
                                        ` (${article.linkedLocation.radius / 1000}km radius)`}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Thumbnail */}
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-[#97F0E5]">
                        <Image
                            src={article.thumbnailBlob.url}
                            alt={article.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Verify Button */}
                    <div className="flex items-center justify-between p-4 bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-lg">
                        <div className="flex items-center gap-2 text-[#97F0E5]">
                            <CheckCircle2 size={24} />
                            <span className="font-neuebit text-lg">
                                {article.verifyCount} Verifications
                            </span>
                        </div>
                        <button
                            onClick={handleVerify}
                            disabled={isVerifying || hasVerified || !account}
                            className={`flex items-center gap-2 px-6 py-2 rounded-md font-neuebit transition-all ${hasVerified
                                    ? 'bg-[#97F0E5]/20 text-[#97F0E5] border-2 border-[#97F0E5] cursor-not-allowed'
                                    : account
                                        ? 'bg-[#97F0E5] hover:bg-[#97F0E5]/80 text-[#0C0F1D]'
                                        : 'bg-[#97F0E5]/20 text-[#F7F7F7]/50 cursor-not-allowed'
                                }`}
                        >
                            <CheckCircle2 size={18} />
                            <span>
                                {isVerifying
                                    ? 'VERIFYING...'
                                    : hasVerified
                                        ? 'VERIFIED'
                                        : 'VERIFY'}
                            </span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="prose prose-invert max-w-none">
                        <div className="p-6 bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-lg">
                            {isLoadingContent ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 size={32} className="text-[#97F0E5] animate-spin" />
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap text-[#F7F7F7] leading-relaxed">
                                    {content}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Walrus Info */}
                    <div className="p-4 bg-[#090e1d] border-2 border-[#97F0E5]/20 rounded-lg text-xs text-[#F7F7F7]/50">
                        <p className="mb-1">
                            📦 Content stored permanently on Walrus decentralized storage
                        </p>
                        <p className="font-mono">
                            Blob ID: {article.contentBlob.url.split('/').pop()}
                        </p>
                    </div>
                </article>
            </main>
        </div>
    );
}

