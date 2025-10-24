'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, Eye, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getImpactColor } from '@/lib/hypeImpact';

interface ArticleCardProps {
    id: string;
    title: string;
    thumbnailUrl: string;
    impactTag: 'good' | 'bad' | 'worse';
    linkedLocation?: {
        city?: string;
        country?: string;
    };
    verifyCount: number;
    viewCount: number;
    createdAt: string | Date;
}

export function ArticleCard({
    id,
    title,
    thumbnailUrl,
    impactTag,
    linkedLocation,
    verifyCount,
    viewCount,
    createdAt,
}: ArticleCardProps) {
    const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    const tagColor = getImpactColor(impactTag);

    return (
        <Link href={`/articles/${id}`}>
            <div className="group relative bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-lg overflow-hidden hover:border-[#97F0E5] transition-all duration-300 hover:scale-[1.02]">
                {/* Thumbnail */}
                <div className="relative w-full aspect-video bg-[#090e1d]">
                    <Image
                        src={thumbnailUrl}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090e1d] via-transparent to-transparent opacity-60" />

                    {/* Impact Tag Badge */}
                    <div
                        className="absolute top-3 right-3 px-3 py-1 rounded-full font-neuebit text-xs uppercase backdrop-blur-sm"
                        style={{
                            backgroundColor: `${tagColor}20`,
                            borderColor: tagColor,
                            color: tagColor,
                            border: '2px solid',
                        }}
                    >
                        {impactTag}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                    <h3 className="font-mondwest text-lg text-[#F7F7F7] truncate group-hover:text-[#97F0E5] transition-colors">
                        {title}
                    </h3>

                    {linkedLocation?.city && linkedLocation?.country && (
                        <div className="flex items-center gap-2 text-sm text-[#F7F7F7]/70">
                            <MapPin size={14} className="text-[#C684F6]" />
                            <span>{linkedLocation.city}, {linkedLocation.country}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-[#F7F7F7]/70">
                        <Calendar size={14} className="text-[#97F0E5]" />
                        <span>{timeAgo}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-2 text-sm">
                        <div className="flex items-center gap-1 text-[#97F0E5]">
                            <CheckCircle2 size={16} />
                            <span>{verifyCount}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#F7F7F7]/50">
                            <Eye size={16} />
                            <span>{viewCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

