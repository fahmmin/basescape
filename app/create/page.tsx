'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, useSignPersonalMessage } from '@/lib/walletContext';
import { AnimationBackground } from '@/components/AnimationBackground';
import { ImageUp, Image, Send } from 'lucide-react';
import { toast } from 'sonner';
import { messageFor } from '@/lib/crypto';
import { uploadToWalrus } from '@/lib/uploadBlob';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MiB

export default function CreatePage() {
    const router = useRouter();
    const account = useCurrentAccount();
    const { mutateAsync: signMessage } = useSignPersonalMessage();

    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [lng, setLng] = useState('');
    const [lat, setLat] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const publisherUrl = process.env.NEXT_PUBLIC_PUBLISHER_BASE_URL || 'https://publisher.walrus-testnet.walrus.space';
    const aggregatorUrl = process.env.NEXT_PUBLIC_AGGREGATOR_BASE_URL || 'https://aggregator.walrus-testnet.walrus.space';

    const validateFile = (file: File): string | null => {
        if (file.size > MAX_FILE_SIZE) {
            return `File size exceeds 10 MiB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)} MiB`;
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

        if (!file || !title.trim() || !caption.trim() || !city.trim() || !country.trim() || !lng || !lat) {
            toast.error('Please fill in all fields and select an image');
            return;
        }

        const lngNum = parseFloat(lng);
        const latNum = parseFloat(lat);
        if (isNaN(lngNum) || isNaN(latNum) || lngNum < -180 || lngNum > 180 || latNum < -90 || latNum > 90) {
            toast.error('Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Uploading image to Walrus...');

        try {
            // Step 1: Upload image to Walrus
            const uploadResult = await uploadToWalrus(file, publisherUrl, aggregatorUrl);

            toast.loading('Signing transaction...', { id: toastId });

            // Step 2: Sign the creation message
            const message = messageFor('create');
            const messageBytes = new TextEncoder().encode(message);
            const { signature } = await signMessage({ message: messageBytes });

            toast.loading('Creating your drop...', { id: toastId });

            // Step 3: Submit to API
            const response = await fetch('/api/drops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    caption: caption.trim(),
                    city: city.trim(),
                    country: country.trim(),
                    lng: lngNum,
                    lat: latNum,
                    media: {
                        blobId: uploadResult.blobId,
                        url: uploadResult.url,
                    },
                    walrus: uploadResult.walrusMeta,
                    signature,
                    wallet: account.address,
                }),
            });

            const data = await response.json();

            if (data.ok) {
                toast.success('Drop created successfully! 🎉', { id: toastId });
                router.push(`/drop/${data.data._id}`);
            } else {
                toast.error(data.error || 'Failed to create drop', { id: toastId });
            }
        } catch (error) {
            console.error('Error creating drop:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create drop', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full min-h-[600px] font-montreal">
            <AnimationBackground />

            <main className="w-full max-w-2xl px-4 py-8 mt-8">
                <h1 className="font-mondwest text-4xl md:text-5xl mb-4 text-center">
                    Create a Culture Drop
                </h1>
                <p className="text-center text-[#F7F7F7]/70 mb-8">
                    Share your favorite place with the world. Images are permanently stored on Walrus blockchain, secured by Sui signatures, and may earn you NFT rewards.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6 bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-lg p-6">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-neuebit text-[#F7F7F7]/70 mb-2">
                            Place Image * (Stored on Walrus)
                        </label>
                        <div className="w-full p-2 bg-[#090e1d] border-2 border-[#97F0E5]/30 rounded-md">
                            <div className="relative">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        const selectedFile = e.target.files?.[0];
                                        if (selectedFile) {
                                            const error = validateFile(selectedFile);
                                            if (error) {
                                                toast.error(error);
                                                setFile(null);
                                            } else {
                                                setFile(selectedFile);
                                            }
                                        }
                                    }}
                                />
                                <div className="w-full p-4 border-2 border-[#97F0E5]/30 border-dashed rounded-md flex items-center justify-center min-h-[150px]">
                                    {file ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Image size={48} className="text-[#97F0E5]" />
                                            <p className="text-[#F7F7F7] text-center">{file.name}</p>
                                            <p className="text-sm text-[#F7F7F7]/70">
                                                {(file.size / (1024 * 1024)).toFixed(2)} MiB
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <ImageUp size={48} className="text-[#97F0E5]" />
                                            <p className="text-[#F7F7F7]">Click or drag to upload</p>
                                            <p className="text-sm text-[#F7F7F7]/50">Max 10 MiB • Permanent Walrus storage</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-neuebit text-[#F7F7F7]/70 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                            placeholder="Amazing rooftop in Tokyo"
                            className="w-full p-3 bg-[#090e1d] border-2 border-[#97F0E5]/30 rounded-md text-[#F7F7F7] focus:outline-none focus:border-[#97F0E5] transition-colors"
                        />
                    </div>

                    {/* Caption */}
                    <div>
                        <label className="block text-sm font-neuebit text-[#F7F7F7]/70 mb-2">
                            Caption *
                        </label>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            maxLength={500}
                            rows={4}
                            placeholder="Tell us about this place..."
                            className="w-full p-3 bg-[#090e1d] border-2 border-[#97F0E5]/30 rounded-md text-[#F7F7F7] focus:outline-none focus:border-[#97F0E5] transition-colors resize-none"
                        />
                        <div className="text-sm text-[#F7F7F7]/50 text-right mt-1">
                            {caption.length}/500
                        </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-neuebit text-[#F7F7F7]/70 mb-2">
                                City *
                            </label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Tokyo"
                                className="w-full p-3 bg-[#090e1d] border-2 border-[#97F0E5]/30 rounded-md text-[#F7F7F7] focus:outline-none focus:border-[#97F0E5] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-neuebit text-[#F7F7F7]/70 mb-2">
                                Country *
                            </label>
                            <input
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                placeholder="Japan"
                                className="w-full p-3 bg-[#090e1d] border-2 border-[#97F0E5]/30 rounded-md text-[#F7F7F7] focus:outline-none focus:border-[#97F0E5] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Coordinates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-neuebit text-[#F7F7F7]/70 mb-2">
                                Longitude * (-180 to 180)
                            </label>
                            <input
                                type="number"
                                value={lng}
                                onChange={(e) => setLng(e.target.value)}
                                step="0.000001"
                                placeholder="139.691706"
                                className="w-full p-3 bg-[#090e1d] border-2 border-[#97F0E5]/30 rounded-md text-[#F7F7F7] focus:outline-none focus:border-[#97F0E5] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-neuebit text-[#F7F7F7]/70 mb-2">
                                Latitude * (-90 to 90)
                            </label>
                            <input
                                type="number"
                                value={lat}
                                onChange={(e) => setLat(e.target.value)}
                                step="0.000001"
                                placeholder="35.689487"
                                className="w-full p-3 bg-[#090e1d] border-2 border-[#97F0E5]/30 rounded-md text-[#F7F7F7] focus:outline-none focus:border-[#97F0E5] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !account}
                        className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-md font-neuebit text-lg transition-all ${isSubmitting || !account
                            ? 'bg-[#97F0E5]/20 text-[#F7F7F7]/50 cursor-not-allowed'
                            : 'bg-[#97F0E5] hover:bg-[#97F0E5]/80 text-[#0C0F1D]'
                            }`}
                    >
                        <Send size={20} />
                        <span>{isSubmitting ? 'CREATING...' : account ? 'CREATE DROP' : 'CONNECT WALLET FIRST'}</span>
                    </button>
                </form>
            </main>
        </div>
    );
}

