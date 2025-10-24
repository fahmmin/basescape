'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, useSignPersonalMessage } from '@mysten/dapp-kit';
import { AnimationBackground } from '@/components/AnimationBackground';
import { ImageUp, Image, FileText, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { messageFor } from '@/lib/crypto';
import { uploadToWalrus } from '@/lib/uploadBlob';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MiB

export default function CreateArticlePage() {
    const router = useRouter();
    const account = useCurrentAccount();
    const { mutateAsync: signMessage } = useSignPersonalMessage();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

    // Optional location linking
    const [linkToLocation, setLinkToLocation] = useState(false);
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [lng, setLng] = useState('');
    const [lat, setLat] = useState('');
    const [radius, setRadius] = useState('5000'); // Default 5km

    const [impactTag, setImpactTag] = useState<'good' | 'bad' | 'worse'>('good');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const publisherUrl =
        process.env.NEXT_PUBLIC_PUBLISHER_BASE_URL ||
        'https://publisher.walrus-testnet.walrus.space';
    const aggregatorUrl =
        process.env.NEXT_PUBLIC_AGGREGATOR_BASE_URL ||
        'https://aggregator.walrus-testnet.walrus.space';

    const validateFile = (file: File): string | null => {
        if (file.size > MAX_FILE_SIZE) {
            return `File size exceeds 10 MiB limit. Current size: ${(
                file.size /
                (1024 * 1024)
            ).toFixed(2)} MiB`;
        }
        if (!file.type.startsWith('image/')) {
            return 'Only image files are allowed';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!account) {
            toast.error('Please connect your wallet first');
            return;
        }

        if (!thumbnailFile || !title.trim() || !content.trim()) {
            toast.error('Please provide thumbnail, title, and content');
            return;
        }

        if (linkToLocation) {
            if (!city.trim() || !country.trim() || !lng || !lat) {
                toast.error('Please fill all location fields if linking to a location');
                return;
            }

            const lngNum = parseFloat(lng);
            const latNum = parseFloat(lat);
            if (
                isNaN(lngNum) ||
                isNaN(latNum) ||
                lngNum < -180 ||
                lngNum > 180 ||
                latNum < -90 ||
                latNum > 90
            ) {
                toast.error('Invalid coordinates');
                return;
            }
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Uploading thumbnail to Walrus...');

        try {
            // Step 1: Upload thumbnail
            const thumbnailResult = await uploadToWalrus(
                thumbnailFile,
                publisherUrl,
                aggregatorUrl
            );

            toast.loading('Uploading content to Walrus...', { id: toastId });

            // Step 2: Upload content as blob
            const contentBlob = new Blob([content], { type: 'text/plain' });
            const contentFile = new File(
                [contentBlob],
                `${title.replace(/\s+/g, '-')}-content.txt`,
                { type: 'text/plain' }
            );
            const contentResult = await uploadToWalrus(
                contentFile,
                publisherUrl,
                aggregatorUrl
            );

            toast.loading('Signing transaction...', { id: toastId });

            // Step 3: Sign
            const message = messageFor('create');
            const messageBytes = new TextEncoder().encode(message);
            const { signature } = await signMessage({ message: messageBytes });

            toast.loading('Creating article...', { id: toastId });

            // Step 4: Create article
            const articleData: Record<string, unknown> = {
                title: title.trim(),
                thumbnailBlob: {
                    blobId: thumbnailResult.blobId,
                    url: thumbnailResult.url,
                },
                contentBlob: {
                    blobId: contentResult.blobId,
                    url: contentResult.url,
                },
                impactTag,
                walrus: {
                    thumbnailCertId: thumbnailResult.walrusMeta?.certificateId,
                    contentCertId: contentResult.walrusMeta?.certificateId,
                    publisherUrl,
                    aggregatorUrl,
                },
                signature,
                wallet: account.address,
            };

            if (linkToLocation) {
                articleData.linkedLocation = {
                    city: city.trim(),
                    country: country.trim(),
                    coordinates: [parseFloat(lng), parseFloat(lat)],
                    radius: parseInt(radius),
                };

                // Trigger hype recalculation for affected drops
                toast.loading('Recalculating hype scores...', { id: toastId });
                await fetch('/api/drops/recalculate-hype', { method: 'POST' });
            }

            const response = await fetch('/api/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(articleData),
            });

            const data = await response.json();

            if (data.ok) {
                toast.success('Article created successfully! 🎉', { id: toastId });
                router.push(`/articles/${data.data._id}`);
            } else {
                toast.error(data.error || 'Failed to create article', { id: toastId });
            }
        } catch (error) {
            console.error('Error creating article:', error);
            toast.error(
                error instanceof Error ? error.message : 'Failed to create article',
                { id: toastId }
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full min-h-[600px] font-montreal">
            <AnimationBackground />

            <main className="w-full max-w-4xl px-4 py-8 mt-8">
                <h1 className="font-mondwest text-4xl md:text-5xl mb-4 text-center">
                    Create Article
                </h1>
                <p className="text-center text-[#F7F7F7]/70 mb-8">
                    Share news, reports, or stories permanently stored on Walrus blockchain. Articles can impact hype scores of nearby locations with GOOD/BAD/WORSE effects.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-lg p-6"
                >
                    {/* Thumbnail Upload */}
                    <div>
                        <label className="block text-sm font-neuebit text-[#F7F7F7]/70 mb-2">
                            Thumbnail Image *
                        </label>
                        <div className="w-full p-2 bg-[#090e1d] border-2 border-[#97F0E5]/30 rounded-md">
                            <div className="relative w-full p-4 border-2 border-[#97F0E5]/30 border-dashed rounded-md flex items-center justify-center min-h-[120px]">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={(e) => {
                                        const selectedFile = e.target.files?.[0];
                                        if (selectedFile) {
                                            const error = validateFile(selectedFile);
                                            if (error) {
                                                toast.error(error);
                                                setThumbnailFile(null);
                                            } else {
                                                setThumbnailFile(selectedFile);
                                            }
                                        }
                                    }}
                                />
                                {thumbnailFile ? (
                                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                                        <Image size={40} className="text-[#97F0E5]" />
                                        <p className="text-[#F7F7F7] text-center text-sm">
                                            {thumbnailFile.name}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                                        <ImageUp size={40} className="text-[#97F0E5]" />
                                        <p className="text-[#F7F7F7] text-sm">
                                            Click to upload thumbnail
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-neuebit text-[#F7F7F7]/70 mb-2">
                            Article Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={200}
                            placeholder="Breaking: Major event in..."
                            className="w-full p-3 bg-[#090e1d] border-2 border-[#97F0E5]/30 rounded-md text-[#F7F7F7] focus:outline-none focus:border-[#97F0E5] transition-colors"
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-neuebit text-[#F7F7F7]/70 mb-2">
                            Article Content *
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            maxLength={10000}
                            rows={12}
                            placeholder="Write your article content here... (Max 10,000 characters)"
                            className="w-full p-3 bg-[#090e1d] border-2 border-[#97F0E5]/30 rounded-md text-[#F7F7F7] focus:outline-none focus:border-[#97F0E5] transition-colors resize-none font-mono text-sm"
                        />
                        <div className="text-sm text-[#F7F7F7]/50 text-right mt-1">
                            {content.length}/10,000
                        </div>
                    </div>

                    {/* Impact Tag */}
                    <div>
                        <label className="block text-sm font-neuebit text-[#F7F7F7]/70 mb-2">
                            Impact Tag * (affects nearby drop hype scores)
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { value: 'good' as const, label: 'GOOD', color: '#97F0E5' },
                                { value: 'bad' as const, label: 'BAD', color: '#FFA500' },
                                { value: 'worse' as const, label: 'WORSE', color: '#FF4444' },
                            ].map(({ value, label, color }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setImpactTag(value)}
                                    className={`p-3 rounded-md font-neuebit transition-all ${impactTag === value
                                        ? 'border-2'
                                        : 'border-2 border-transparent opacity-50'
                                        }`}
                                    style={{
                                        backgroundColor: `${color}20`,
                                        borderColor: impactTag === value ? color : 'transparent',
                                        color,
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Optional Location Linking */}
                    <div className="border-t-2 border-[#97F0E5]/20 pt-4">
                        <label className="flex items-center gap-2 cursor-pointer mb-4">
                            <input
                                type="checkbox"
                                checked={linkToLocation}
                                onChange={(e) => setLinkToLocation(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-neuebit text-[#F7F7F7]/70">
                                Link to specific location (affects nearby drops)
                            </span>
                            <MapPin size={16} className="text-[#C684F6]" />
                        </label>

                        {linkToLocation && (
                            <div className="space-y-4 pl-6 border-l-2 border-[#C684F6]">
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="City"
                                        className="p-3 bg-[#090e1d] border-2 border-[#97F0E5]/30 rounded-md text-[#F7F7F7] focus:outline-none focus:border-[#97F0E5]"
                                    />
                                    <input
                                        type="text"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        placeholder="Country"
                                        className="p-3 bg-[#090e1d] border-2 border-[#97F0E5]/30 rounded-md text-[#F7F7F7] focus:outline-none focus:border-[#97F0E5]"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <input
                                        type="number"
                                        value={lng}
                                        onChange={(e) => setLng(e.target.value)}
                                        step="0.000001"
                                        placeholder="Longitude"
                                        className="p-3 bg-[#090e1d] border-2 border-[#97F0E5]/30 rounded-md text-[#F7F7F7] focus:outline-none focus:border-[#97F0E5]"
                                    />
                                    <input
                                        type="number"
                                        value={lat}
                                        onChange={(e) => setLat(e.target.value)}
                                        step="0.000001"
                                        placeholder="Latitude"
                                        className="p-3 bg-[#090e1d] border-2 border-[#97F0E5]/30 rounded-md text-[#F7F7F7] focus:outline-none focus:border-[#97F0E5]"
                                    />
                                    <input
                                        type="number"
                                        value={radius}
                                        onChange={(e) => setRadius(e.target.value)}
                                        placeholder="Radius (m)"
                                        className="p-3 bg-[#090e1d] border-2 border-[#97F0E5]/30 rounded-md text-[#F7F7F7] focus:outline-none focus:border-[#97F0E5]"
                                    />
                                </div>
                                <p className="text-xs text-[#F7F7F7]/50">
                                    Impact radius in meters (default: 5000m = 5km)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !account}
                        className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-md font-neuebit text-lg transition-all ${isSubmitting || !account
                            ? 'bg-[#97F0E5]/20 text-[#F7F7F7]/50 cursor-not-allowed'
                            : 'bg-[#97F0E5] hover:bg-[#97F0E5]/80 text-[#0C0F1D]'
                            }`}
                    >
                        <FileText size={20} />
                        <span>
                            {isSubmitting
                                ? 'CREATING...'
                                : account
                                    ? 'CREATE ARTICLE'
                                    : 'CONNECT WALLET FIRST'}
                        </span>
                    </button>
                </form>
            </main>
        </div>
    );
}

