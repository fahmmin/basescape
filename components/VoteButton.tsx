'use client';

import { useState } from 'react';
import { useCurrentAccount, useSignPersonalMessage } from '@mysten/dapp-kit';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { messageFor } from '@/lib/crypto';

interface VoteButtonProps {
    dropId: string;
    initialVoteCount: number;
    onVoteSuccess?: (newCount: number) => void;
}

export function VoteButton({ dropId, initialVoteCount, onVoteSuccess }: VoteButtonProps) {
    const account = useCurrentAccount();
    const { mutateAsync: signMessage } = useSignPersonalMessage();
    const [voteCount, setVoteCount] = useState(initialVoteCount);
    const [isVoting, setIsVoting] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);

    const handleVote = async () => {
        if (!account) {
            toast.error('Please connect your wallet first');
            return;
        }

        if (hasVoted) {
            toast.info('You have already voted');
            return;
        }

        setIsVoting(true);

        try {
            // Sign the vote message
            const message = messageFor('vote', dropId);
            const messageBytes = new TextEncoder().encode(message);
            const { signature } = await signMessage({ message: messageBytes });

            // Submit vote
            const response = await fetch(`/api/drops/${dropId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    signature,
                    wallet: account.address,
                }),
            });

            const data = await response.json();

            if (data.ok) {
                setVoteCount(data.data.voteCount);
                setHasVoted(true);
                toast.success('Vote recorded! 🎉');
                onVoteSuccess?.(data.data.voteCount);
            } else {
                if (data.error === 'Already voted') {
                    setHasVoted(true);
                }
                toast.error(data.error || 'Failed to vote');
            }
        } catch (error) {
            console.error('Vote error:', error);
            toast.error('Failed to vote');
        } finally {
            setIsVoting(false);
        }
    };

    return (
        <button
            onClick={handleVote}
            disabled={isVoting || hasVoted || !account}
            className={`flex items-center gap-2 px-6 py-3 rounded-md font-neuebit transition-all ${hasVoted
                    ? 'bg-[#C684F6]/20 text-[#C684F6] border-2 border-[#C684F6] cursor-not-allowed'
                    : account
                        ? 'bg-[#C684F6] hover:bg-[#C684F6]/80 text-[#0C0F1D] border-2 border-[#C684F6]'
                        : 'bg-[#97F0E5]/20 text-[#F7F7F7]/50 border-2 border-[#97F0E5]/30 cursor-not-allowed'
                }`}
        >
            <Heart size={20} fill={hasVoted ? '#C684F6' : 'none'} />
            <span>{isVoting ? 'VOTING...' : hasVoted ? 'VOTED' : 'UPVOTE'}</span>
            <span className="ml-2 px-2 py-0.5 bg-[#090e1d] rounded-md">{voteCount}</span>
        </button>
    );
}

