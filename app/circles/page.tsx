'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, useSignPersonalMessage } from '@/lib/walletContext';
import { AnimationBackground } from '@/components/AnimationBackground';
import { Users, Plus, Loader2, MessageCircle, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { messageFor } from '@/lib/crypto';

interface Circle {
    _id: string;
    name: string;
    description: string;
    admin: string;
    members: string[];
    isPrivate: boolean;
    createdAt: string;
}

export default function CirclesPage() {
    const router = useRouter();
    const account = useCurrentAccount();
    const { mutateAsync: signMessage } = useSignPersonalMessage();

    const [circles, setCircles] = useState<Circle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newCircleName, setNewCircleName] = useState('');
    const [newCircleDesc, setNewCircleDesc] = useState('');
    const [isPrivate, setIsPrivate] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (account) {
                await fetchCircles();
            } else {
                setIsLoading(false);
            }
        };

        loadData();
    }, [account]);

    const fetchCircles = async () => {
        if (!account) return;

        try {
            const response = await fetch(`/api/circles?wallet=${account.address}`);
            const data = await response.json();
            if (data.ok) {
                setCircles(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch circles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCircle = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!account) {
            toast.error('Please connect your wallet');
            return;
        }

        if (!newCircleName.trim()) {
            toast.error('Please enter a circle name');
            return;
        }

        setIsCreating(true);

        try {
            const message = messageFor('create');
            const messageBytes = new TextEncoder().encode(message);
            const { signature } = await signMessage({ message: messageBytes });

            const response = await fetch('/api/circles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newCircleName.trim(),
                    description: newCircleDesc.trim(),
                    isPrivate,
                    signature,
                    wallet: account.address,
                }),
            });

            const data = await response.json();

            if (data.ok) {
                toast.success('Circle created! 🎉');
                setNewCircleName('');
                setNewCircleDesc('');
                setShowCreateForm(false);
                fetchCircles();
            } else {
                toast.error(data.error || 'Failed to create circle');
            }
        } catch (error) {
            console.error('Error creating circle:', error);
            toast.error('Failed to create circle');
        } finally {
            setIsCreating(false);
        }
    };

    const handleLeaveCircle = async (circleId: string) => {
        if (!account) return;

        try {
            const response = await fetch(`/api/circles/${circleId}/leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet: account.address }),
            });

            const data = await response.json();

            if (data.ok) {
                toast.success('Left circle');
                fetchCircles();
            } else {
                toast.error(data.error || 'Failed to leave circle');
            }
        } catch (error) {
            console.error('Error leaving circle:', error);
            toast.error('Failed to leave circle');
        }
    };

    const handleOpenCircleChat = async (circle: Circle) => {
        try {
            // Create or get circle conversation
            const response = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participants: circle.members,
                    type: 'circle',
                    circleId: circle._id,
                    name: circle.name,
                }),
            });

            const data = await response.json();

            if (data.ok) {
                router.push(`/chat?conversation=${data.data._id}`);
            }
        } catch (error) {
            console.error('Error opening chat:', error);
            toast.error('Failed to open chat');
        }
    };

    if (!account) {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-[600px]">
                <AnimationBackground />
                <Users size={64} className="text-[#F7F7F7]/30 mb-4" />
                <p className="text-[#F7F7F7]/70 text-xl">
                    Connect your wallet to manage circles
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-[600px]">
                <AnimationBackground />
                <Loader2 size={48} className="text-[#97F0E5] animate-spin mb-4" />
                <p className="text-[#F7F7F7]/70">Loading circles...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full min-h-[600px] font-montreal">
            <AnimationBackground />

            <main className="w-full max-w-5xl px-4 py-8 mt-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Users size={48} className="text-[#C684F6]" />
                            <h1 className="font-mondwest text-4xl md:text-5xl">Circles</h1>
                        </div>
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="flex items-center gap-2 px-6 py-3 bg-[#C684F6] hover:bg-[#C684F6]/80 text-[#0C0F1D] rounded-md font-neuebit transition-all"
                        >
                            <Plus size={20} />
                            <span>CREATE CIRCLE</span>
                        </button>
                    </div>
                </div>

                {/* Create Form */}
                {showCreateForm && (
                    <div className="mb-8 p-6 bg-[#0C0F1D] border-2 border-[#C684F6]/30 rounded-lg">
                        <h2 className="font-mondwest text-xl mb-4">New Circle</h2>
                        <form onSubmit={handleCreateCircle} className="space-y-4">
                            <input
                                type="text"
                                value={newCircleName}
                                onChange={(e) => setNewCircleName(e.target.value)}
                                placeholder="Circle name"
                                maxLength={50}
                                className="w-full p-3 bg-[#090e1d] border-2 border-[#C684F6]/30 rounded-md text-[#F7F7F7] focus:outline-none focus:border-[#C684F6]"
                            />
                            <textarea
                                value={newCircleDesc}
                                onChange={(e) => setNewCircleDesc(e.target.value)}
                                placeholder="Description (optional)"
                                rows={3}
                                maxLength={200}
                                className="w-full p-3 bg-[#090e1d] border-2 border-[#C684F6]/30 rounded-md text-[#F7F7F7] focus:outline-none focus:border-[#C684F6] resize-none"
                            />
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isPrivate}
                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm text-[#F7F7F7]/70">Private Circle</span>
                            </label>
                            <button
                                type="submit"
                                disabled={isCreating}
                                className={`w-full py-3 rounded-md font-neuebit transition-all ${isCreating
                                    ? 'bg-[#C684F6]/20 text-[#F7F7F7]/50 cursor-not-allowed'
                                    : 'bg-[#C684F6] hover:bg-[#C684F6]/80 text-[#0C0F1D]'
                                    }`}
                            >
                                {isCreating ? 'CREATING...' : 'CREATE'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Circles Grid */}
                {circles.length === 0 ? (
                    <div className="text-center py-12 text-[#F7F7F7]/50">
                        No circles yet. Create one to start!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {circles.map((circle) => (
                            <div
                                key={circle._id}
                                className="p-6 bg-[#0C0F1D] border-2 border-[#C684F6]/30 rounded-lg hover:border-[#C684F6] transition-colors"
                            >
                                <h3 className="font-mondwest text-xl mb-2 text-[#F7F7F7]">
                                    {circle.name}
                                </h3>
                                {circle.description && (
                                    <p className="text-sm text-[#F7F7F7]/70 mb-3">
                                        {circle.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-2 text-sm text-[#F7F7F7]/50 mb-4">
                                    <Users size={16} />
                                    <span>{circle.members.length} members</span>
                                    {circle.admin === account?.address && (
                                        <span className="ml-2 px-2 py-0.5 bg-[#C684F6]/20 text-[#C684F6] rounded text-xs font-neuebit">
                                            ADMIN
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenCircleChat(circle)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#C684F6] hover:bg-[#C684F6]/80 text-[#0C0F1D] rounded-md font-neuebit transition-all"
                                    >
                                        <MessageCircle size={18} />
                                        <span>CHAT</span>
                                    </button>
                                    {circle.admin !== account?.address && (
                                        <button
                                            onClick={() => handleLeaveCircle(circle._id)}
                                            className="px-4 py-2 bg-[#FF4444]/20 hover:bg-[#FF4444]/40 text-[#FF4444] rounded-md transition-all"
                                        >
                                            <LogOut size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

