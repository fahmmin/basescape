'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, Heart, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DropCardProps {
    id: string;
    title: string;
    city: string;
    country: string;
    imageUrl: string;
    createdAt: string | Date;
    voteCount?: number;
    uniqueCommenters?: number;
    hypeScore?: number;
}

export function DropCard({
    id,
    title,
    city,
    country,
    imageUrl,
    createdAt,
    voteCount = 0,
    uniqueCommenters = 0,
    hypeScore,
}: DropCardProps) {
    const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

    return (
        <Link href={`/drop/${id}`}>
            <div className="group relative bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-lg overflow-hidden hover:border-[#97F0E5] transition-all duration-300 hover:scale-[1.02]">
                {/* Image */}
                <div className="relative w-full aspect-square bg-[#090e1d]">
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090e1d] via-transparent to-transparent opacity-60" />
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                    <h3 className="font-mondwest text-lg text-[#F7F7F7] truncate group-hover:text-[#97F0E5] transition-colors">
                        {title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-[#F7F7F7]/70">
                        <MapPin size={14} className="text-[#C684F6]" />
                        <span>{city}, {country}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-[#F7F7F7]/70">
                        <Calendar size={14} className="text-[#97F0E5]" />
                        <span>{timeAgo}</span>
                    </div>

                    {/* Engagement Stats */}
                    <div className="flex items-center gap-4 pt-2 text-sm">
                        <div className="flex items-center gap-1 text-[#C684F6]">
                            <Heart size={16} />
                            <span>{voteCount}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#97F0E5]">
                            <MessageCircle size={16} />
                            <span>{uniqueCommenters}</span>
                        </div>
                        {hypeScore !== undefined && (
                            <div className="ml-auto text-[#F7F7F7]/50 font-neuebit">
                                HYPE: {hypeScore.toFixed(1)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

