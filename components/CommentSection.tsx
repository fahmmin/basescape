'use client';

import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
    _id: string;
    pseudo: string;
    text: string;
    createdAt: string | Date;
}

interface CommentSectionProps {
    dropId: string;
    initialComments: Comment[];
}

export function CommentSection({ dropId, initialComments }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [pseudo, setPseudo] = useState('');
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!pseudo.trim() || !text.trim()) {
            toast.error('Please fill in both name and comment');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/drops/${dropId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pseudo: pseudo.trim(),
                    text: text.trim(),
                }),
            });

            const data = await response.json();

            if (data.ok) {
                setComments([data.data, ...comments]);
                setText('');
                toast.success('Comment posted! 💬');
            } else {
                toast.error(data.error || 'Failed to post comment');
            }
        } catch (error) {
            console.error('Comment error:', error);
            toast.error('Failed to post comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-mondwest text-xl text-[#F7F7F7] flex items-center gap-2">
                    <MessageCircle size={24} className="text-[#97F0E5]" />
                    Leave a Review
                </h3>

                <div>
                    <label className="block text-sm font-neuebit text-[#F7F7F7]/70 mb-2">
                        Your Name (Anonymous)
                    </label>
                    <input
                        type="text"
                        value={pseudo}
                        onChange={(e) => setPseudo(e.target.value)}
                        maxLength={50}
                        placeholder="Cultural Explorer"
                        className="w-full p-3 bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-md text-[#F7F7F7] focus:outline-none focus:border-[#97F0E5] transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-neuebit text-[#F7F7F7]/70 mb-2">
                        Your Review
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        maxLength={500}
                        rows={4}
                        placeholder="Share your thoughts about this place..."
                        className="w-full p-3 bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-md text-[#F7F7F7] focus:outline-none focus:border-[#97F0E5] transition-colors resize-none"
                    />
                    <div className="text-sm text-[#F7F7F7]/50 text-right mt-1">
                        {text.length}/500
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !pseudo.trim() || !text.trim()}
                    className={`flex items-center gap-2 px-6 py-3 rounded-md font-neuebit transition-all ${isSubmitting || !pseudo.trim() || !text.trim()
                            ? 'bg-[#97F0E5]/20 text-[#F7F7F7]/50 cursor-not-allowed'
                            : 'bg-[#97F0E5] hover:bg-[#97F0E5]/80 text-[#0C0F1D]'
                        }`}
                >
                    <Send size={18} />
                    <span>{isSubmitting ? 'POSTING...' : 'POST REVIEW'}</span>
                </button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
                <h3 className="font-neuebit text-lg text-[#F7F7F7]">
                    REVIEWS ({comments.length})
                </h3>

                {comments.length === 0 ? (
                    <p className="text-[#F7F7F7]/50 text-center py-8">
                        No reviews yet. Be the first to share your thoughts!
                    </p>
                ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {comments.map((comment) => (
                            <div
                                key={comment._id}
                                className="p-4 bg-[#0C0F1D] border-2 border-[#97F0E5]/20 rounded-lg"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-neuebit text-[#C684F6]">
                                        {comment.pseudo}
                                    </span>
                                    <span className="text-sm text-[#F7F7F7]/50">
                                        {formatDistanceToNow(new Date(comment.createdAt), {
                                            addSuffix: true,
                                        })}
                                    </span>
                                </div>
                                <p className="text-[#F7F7F7]">{comment.text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

