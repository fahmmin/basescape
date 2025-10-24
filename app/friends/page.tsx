'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, useSignPersonalMessage } from '@/lib/walletContext';
import { AnimationBackground } from '@/components/AnimationBackground';
import {
    Users,
    UserPlus,
    Check,
    X,
    Loader2,
    MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { messageFor } from '@/lib/crypto';
import { formatDistanceToNow } from 'date-fns';

interface Friend {
    _id: string;
    friendWallet: string;
    createdAt: string;
}

interface FriendRequest {
    _id: string;
    requester: string;
    recipient: string;
    createdAt: string;
}

export default function FriendsPage() {
    const router = useRouter();
    const account = useCurrentAccount();
    const { mutateAsync: signMessage } = useSignPersonalMessage();

    const [friends, setFriends] = useState<Friend[]>([]);
    const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newFriendWallet, setNewFriendWallet] = useState('');
    const [isSending, setIsSending] = useState(false);

    const fetchFriends = useCallback(async () => {
        if (!account) return;

        try {
            const response = await fetch(`/api/friends?wallet=${account.address}`);
            const data = await response.json();
            if (data.ok) {
                setFriends(data.data.friends);
                setPendingRequests(data.data.pendingRequests);
                setSentRequests(data.data.sentRequests);
            }
        } catch (error) {
            console.error('Failed to fetch friends:', error);
        } finally {
            setIsLoading(false);
        }
    }, [account]);

    useEffect(() => {
        const loadData = async () => {
            if (account) {
                await fetchFriends();
            } else {
                setIsLoading(false);
            }
        };

        loadData();
    }, [account, fetchFriends]);

    const handleSendRequest = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!account) {
            toast.error('Please connect your wallet');
            return;
        }

        if (!newFriendWallet.trim()) {
            toast.error('Please enter a wallet address');
            return;
        }

        setIsSending(true);

        try {
            const message = messageFor('create');
            const messageBytes = new TextEncoder().encode(message);
            const { signature } = await signMessage({ message: messageBytes });

            const response = await fetch('/api/friends/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient: newFriendWallet.trim(),
                    signature,
                    wallet: account.address,
                }),
            });

            const data = await response.json();

            if (data.ok) {
                toast.success('Friend request sent!');
                setNewFriendWallet('');
                fetchFriends();
            } else {
                toast.error(data.error || 'Failed to send request');
            }
        } catch (error) {
            console.error('Error sending request:', error);
            toast.error('Failed to send request');
        } finally {
            setIsSending(false);
        }
    };

    const handleAccept = async (requestId: string) => {
        if (!account) return;

        try {
            const response = await fetch(`/api/friends/${requestId}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet: account.address }),
            });

            const data = await response.json();

            if (data.ok) {
                toast.success('Friend request accepted! 🎉');
                fetchFriends();
            } else {
                toast.error(data.error || 'Failed to accept');
            }
        } catch (error) {
            console.error('Error accepting request:', error);
            toast.error('Failed to accept request');
        }
    };

    const handleReject = async (requestId: string) => {
        if (!account) return;

        try {
            const response = await fetch(`/api/friends/${requestId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet: account.address }),
            });

            const data = await response.json();

            if (data.ok) {
                toast.success('Request rejected');
                fetchFriends();
            } else {
                toast.error(data.error || 'Failed to reject');
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
            toast.error('Failed to reject request');
        }
    };

    const handleStartChat = async (friendWallet: string) => {
        if (!account) return;

        try {
            // Create or get DM conversation
            const response = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participants: [account.address, friendWallet],
                    type: 'dm',
                }),
            });

            const data = await response.json();

            if (data.ok) {
                router.push(`/chat?conversation=${data.data._id}`);
            }
        } catch (error) {
            console.error('Error starting chat:', error);
            toast.error('Failed to start chat');
        }
    };

    if (!account) {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-[600px]">
                <AnimationBackground />
                <Users size={64} className="text-[#F7F7F7]/30 mb-4" />
                <p className="text-[#F7F7F7]/70 text-xl">
                    Connect your Sui wallet to manage friends and start secure conversations
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-[600px]">
                <AnimationBackground />
                <Loader2 size={48} className="text-[#97F0E5] animate-spin mb-4" />
                <p className="text-[#F7F7F7]/70">Loading friends...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full min-h-[600px] font-montreal">
            <AnimationBackground />

            <main className="w-full max-w-5xl px-4 py-8 mt-8">
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Users size={48} className="text-[#97F0E5]" />
                        <h1 className="font-mondwest text-4xl md:text-6xl">Friends</h1>
                    </div>
                </div>

                {/* Add Friend */}
                <div className="mb-8 p-6 bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-lg">
                    <h2 className="font-mondwest text-xl mb-4 flex items-center gap-2">
                        <UserPlus size={24} className="text-[#97F0E5]" />
                        Add Friend (Sui Wallet)
                    </h2>
                    <form onSubmit={handleSendRequest} className="flex gap-4">
                        <input
                            type="text"
                            value={newFriendWallet}
                            onChange={(e) => setNewFriendWallet(e.target.value)}
                            placeholder="Enter wallet address (0x...)"
                            className="flex-1 p-3 bg-[#090e1d] border-2 border-[#97F0E5]/30 rounded-md text-[#F7F7F7] font-mono text-sm focus:outline-none focus:border-[#97F0E5]"
                        />
                        <button
                            type="submit"
                            disabled={isSending}
                            className={`px-6 py-3 rounded-md font-neuebit transition-all ${isSending
                                ? 'bg-[#97F0E5]/20 text-[#F7F7F7]/50 cursor-not-allowed'
                                : 'bg-[#97F0E5] hover:bg-[#97F0E5]/80 text-[#0C0F1D]'
                                }`}
                        >
                            {isSending ? 'SENDING...' : 'SEND REQUEST'}
                        </button>
                    </form>
                </div>

                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                    <div className="mb-8">
                        <h2 className="font-neuebit text-2xl mb-4">
                            Pending Requests ({pendingRequests.length})
                        </h2>
                        <div className="space-y-4">
                            {pendingRequests.map((request) => (
                                <div
                                    key={request._id}
                                    className="p-4 bg-[#0C0F1D] border-2 border-[#C684F6]/30 rounded-lg flex items-center justify-between"
                                >
                                    <div>
                                        <p className="font-mono text-[#F7F7F7]">
                                            {request.requester.slice(0, 12)}...
                                            {request.requester.slice(-8)}
                                        </p>
                                        <p className="text-sm text-[#F7F7F7]/50">
                                            {formatDistanceToNow(new Date(request.createdAt), {
                                                addSuffix: true,
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAccept(request._id)}
                                            className="p-2 bg-[#97F0E5] hover:bg-[#97F0E5]/80 text-[#0C0F1D] rounded-md transition-all"
                                        >
                                            <Check size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleReject(request._id)}
                                            className="p-2 bg-[#FF4444] hover:bg-[#FF4444]/80 text-[#F7F7F7] rounded-md transition-all"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sent Requests */}
                {sentRequests.length > 0 && (
                    <div className="mb-8">
                        <h2 className="font-neuebit text-2xl mb-4">
                            Sent Requests ({sentRequests.length})
                        </h2>
                        <div className="space-y-4">
                            {sentRequests.map((request) => (
                                <div
                                    key={request._id}
                                    className="p-4 bg-[#0C0F1D] border-2 border-[#97F0E5]/20 rounded-lg"
                                >
                                    <p className="font-mono text-[#F7F7F7]/70">
                                        {request.recipient.slice(0, 12)}...
                                        {request.recipient.slice(-8)}
                                    </p>
                                    <p className="text-sm text-[#F7F7F7]/50">Waiting for response...</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Friends List */}
                <div>
                    <h2 className="font-neuebit text-2xl mb-4">
                        My Friends ({friends.length})
                    </h2>
                    {friends.length === 0 ? (
                        <div className="text-center py-12 text-[#F7F7F7]/50">
                            No friends yet. Send a request to start secure wallet-to-wallet conversations!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {friends.map((friend) => (
                                <div
                                    key={friend._id}
                                    className="p-4 bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-lg hover:border-[#97F0E5] transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-mono text-[#F7F7F7]">
                                                {friend.friendWallet.slice(0, 12)}...
                                                {friend.friendWallet.slice(-8)}
                                            </p>
                                            <p className="text-sm text-[#F7F7F7]/50">
                                                Friends since{' '}
                                                {formatDistanceToNow(new Date(friend.createdAt), {
                                                    addSuffix: true,
                                                })}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleStartChat(friend.friendWallet)}
                                            className="p-3 bg-[#97F0E5] hover:bg-[#97F0E5]/80 text-[#0C0F1D] rounded-md transition-all"
                                        >
                                            <MessageCircle size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

