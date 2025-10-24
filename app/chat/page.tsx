'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCurrentAccount } from '@/lib/walletContext';
import { AnimationBackground } from '@/components/AnimationBackground';
import {
    MessageCircle,
    Send,
    Loader2,
    RefreshCw,
    Users,
    Circle as CircleIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
    _id: string;
    type: 'dm' | 'circle' | 'group';
    participants: string[];
    circleId?: string;
    name?: string;
    lastMessage?: {
        sender: string;
        content: string;
        timestamp: string;
    };
    unreadCount: Record<string, number>;
}

interface Message {
    _id: string;
    sender: string;
    content: string;
    createdAt: string;
}

function ChatPageContent() {
    const searchParams = useSearchParams();
    const account = useCurrentAccount();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState('');
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (account) {
                await fetchConversations();
            } else {
                setIsLoadingConversations(false);
            }
        };

        loadData();
    }, [account]);

    useEffect(() => {
        const conversationId = searchParams.get('conversation');
        if (conversationId && conversations.length > 0) {
            const conv = conversations.find((c) => c._id === conversationId);
            if (conv) {
                setSelectedConversation(conv);
                const loadMessages = async () => {
                    await fetchMessages(conversationId);
                };
                loadMessages();
            }
        }
    }, [searchParams, conversations]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        if (!account) return;

        try {
            const response = await fetch(`/api/conversations?wallet=${account.address}`);
            const data = await response.json();
            if (data.ok) {
                setConversations(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setIsLoadingConversations(false);
        }
    };

    const fetchMessages = async (conversationId: string) => {
        setIsLoadingMessages(true);
        try {
            const response = await fetch(
                `/api/messages?conversationId=${conversationId}`
            );
            const data = await response.json();
            if (data.ok) {
                setMessages(data.data);

                // Mark as read
                if (account) {
                    await fetch('/api/messages/mark-read', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            conversationId,
                            wallet: account.address,
                        }),
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!account || !selectedConversation || !messageText.trim()) {
            return;
        }

        setIsSending(true);

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: selectedConversation._id,
                    sender: account.address,
                    content: messageText.trim(),
                }),
            });

            const data = await response.json();

            if (data.ok) {
                setMessages([...messages, data.data]);
                setMessageText('');
            } else {
                toast.error(data.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const handleRefresh = () => {
        if (selectedConversation) {
            fetchMessages(selectedConversation._id);
        }
        fetchConversations();
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const getConversationName = (conv: Conversation) => {
        if (conv.name) return conv.name;
        if (conv.type === 'dm') {
            const otherWallet = conv.participants.find((p) => p !== account?.address);
            return otherWallet
                ? `${otherWallet.slice(0, 6)}...${otherWallet.slice(-4)}`
                : 'Unknown';
        }
        return 'Group Chat';
    };

    const getUnreadCount = (conv: Conversation) => {
        if (!account) return 0;
        return conv.unreadCount?.[account.address] || 0;
    };

    if (!account) {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-[600px]">
                <AnimationBackground />
                <MessageCircle size={64} className="text-[#F7F7F7]/30 mb-4" />
                <p className="text-[#F7F7F7]/70 text-xl">
                    Connect your wallet to access chat
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full min-h-[600px] font-montreal">
            <AnimationBackground />

            <main className="w-full max-w-7xl px-4 py-8 mt-8">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MessageCircle size={40} className="text-[#97F0E5]" />
                        <h1 className="font-mondwest text-3xl md:text-4xl">Messages</h1>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="p-3 bg-[#97F0E5]/20 hover:bg-[#97F0E5]/40 text-[#97F0E5] rounded-md transition-all"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
                    {/* Conversations List */}
                    <div className="md:col-span-1 bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-lg p-4 overflow-y-auto custom-scrollbar">
                        <h2 className="font-neuebit text-lg mb-4 text-[#F7F7F7]/70">
                            CONVERSATIONS
                        </h2>

                        {isLoadingConversations ? (
                            <div className="flex justify-center py-8">
                                <Loader2 size={32} className="text-[#97F0E5] animate-spin" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <p className="text-center py-8 text-[#F7F7F7]/50 text-sm">
                                No conversations yet. Start chatting with friends!
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {conversations.map((conv) => (
                                    <button
                                        key={conv._id}
                                        onClick={() => {
                                            setSelectedConversation(conv);
                                            fetchMessages(conv._id);
                                        }}
                                        className={`w-full text-left p-3 rounded-md transition-all ${selectedConversation?._id === conv._id
                                            ? 'bg-[#97F0E5]/20 border-2 border-[#97F0E5]'
                                            : 'bg-[#090e1d] border-2 border-transparent hover:border-[#97F0E5]/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            {conv.type === 'circle' ? (
                                                <CircleIcon size={16} className="text-[#C684F6]" />
                                            ) : (
                                                <Users size={16} className="text-[#97F0E5]" />
                                            )}
                                            <span className="font-neuebit text-sm text-[#F7F7F7] truncate">
                                                {getConversationName(conv)}
                                            </span>
                                            {getUnreadCount(conv) > 0 && (
                                                <span className="ml-auto px-2 py-0.5 bg-[#C684F6] text-[#0C0F1D] rounded-full text-xs font-neuebit">
                                                    {getUnreadCount(conv)}
                                                </span>
                                            )}
                                        </div>
                                        {conv.lastMessage && (
                                            <p className="text-xs text-[#F7F7F7]/50 truncate">
                                                {conv.lastMessage.content}
                                            </p>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chat View */}
                    <div className="md:col-span-2 bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-lg flex flex-col">
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b-2 border-[#97F0E5]/30">
                                    <h3 className="font-neuebit text-lg text-[#F7F7F7]">
                                        {getConversationName(selectedConversation)}
                                    </h3>
                                    <p className="text-xs text-[#F7F7F7]/50">
                                        {selectedConversation.participants.length} participants
                                    </p>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                                    {isLoadingMessages ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 size={32} className="text-[#97F0E5] animate-spin" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center py-8 text-[#F7F7F7]/50">
                                            No messages yet. Say hi!
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {messages.map((msg) => {
                                                const isOwnMessage = msg.sender === account?.address;
                                                return (
                                                    <div
                                                        key={msg._id}
                                                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div
                                                            className={`max-w-[70%] ${isOwnMessage
                                                                ? 'bg-[#97F0E5] text-[#0C0F1D]'
                                                                : 'bg-[#090e1d] text-[#F7F7F7] border-2 border-[#97F0E5]/30'
                                                                } rounded-lg p-3`}
                                                        >
                                                            {!isOwnMessage && (
                                                                <p className="text-xs text-[#97F0E5] mb-1 font-mono">
                                                                    {msg.sender.slice(0, 6)}...
                                                                    {msg.sender.slice(-4)}
                                                                </p>
                                                            )}
                                                            <p className="break-words">{msg.content}</p>
                                                            <p
                                                                className={`text-xs mt-1 ${isOwnMessage
                                                                    ? 'text-[#0C0F1D]/70'
                                                                    : 'text-[#F7F7F7]/50'
                                                                    }`}
                                                            >
                                                                {formatDistanceToNow(new Date(msg.createdAt), {
                                                                    addSuffix: true,
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    )}
                                </div>

                                {/* Message Input */}
                                <form onSubmit={handleSendMessage} className="p-4 border-t-2 border-[#97F0E5]/30">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            placeholder="Type a message..."
                                            maxLength={1000}
                                            className="flex-1 p-3 bg-[#090e1d] border-2 border-[#97F0E5]/30 rounded-md text-[#F7F7F7] focus:outline-none focus:border-[#97F0E5]"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isSending || !messageText.trim()}
                                            className={`px-6 py-3 rounded-md font-neuebit transition-all ${isSending || !messageText.trim()
                                                ? 'bg-[#97F0E5]/20 text-[#F7F7F7]/50 cursor-not-allowed'
                                                : 'bg-[#97F0E5] hover:bg-[#97F0E5]/80 text-[#0C0F1D]'
                                                }`}
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                                <MessageCircle size={64} className="text-[#F7F7F7]/30 mb-4" />
                                <p className="text-[#F7F7F7]/70">
                                    Select a conversation to start messaging
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-center text-xs text-[#F7F7F7]/50 mt-4">
                    💡 Messages refresh manually. Click the refresh button to see new messages.
                </p>
            </main>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense
            fallback={
                <div className="flex flex-col items-center justify-center w-full min-h-[600px]">
                    <AnimationBackground />
                    <Loader2 size={48} className="text-[#97F0E5] animate-spin mb-4" />
                    <p className="text-[#F7F7F7]/70">Loading chat...</p>
                </div>
            }
        >
            <ChatPageContent />
        </Suspense>
    );
}

