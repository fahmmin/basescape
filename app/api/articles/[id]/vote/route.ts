import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Article from '@/models/Article';
import ArticleVote from '@/models/ArticleVote';
import { verifySuiSignature, normalizeSuiAddress } from '@/lib/auth';
import { messageFor, voteHash } from '@/lib/crypto';

const SERVER_SALT = process.env.SERVER_SALT || 'default-salt-change-in-production';

// POST /api/articles/[id]/vote - Verify/upvote an article
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const body = await request.json();
        const { signature, wallet } = body;

        if (!signature || !wallet) {
            return NextResponse.json(
                { ok: false, error: 'Missing signature or wallet' },
                { status: 400 }
            );
        }

        // Verify signature
        const message = messageFor('vote', id);
        const isValid = await verifySuiSignature({
            message,
            signature,
            address: wallet,
        });

        if (!isValid) {
            return NextResponse.json(
                { ok: false, error: 'Invalid signature' },
                { status: 401 }
            );
        }

        // Normalize wallet
        const normalizedWallet = normalizeSuiAddress(wallet);

        // Generate vote hash
        const hash = voteHash({
            wallet: normalizedWallet,
            postId: id,
            serverSalt: SERVER_SALT,
        });

        // Check if already voted
        const existingVote = await ArticleVote.findOne({ voteHash: hash });
        if (existingVote) {
            return NextResponse.json(
                { ok: false, error: 'Already verified this article' },
                { status: 400 }
            );
        }

        // Create vote
        await ArticleVote.create({
            articleId: id,
            voteHash: hash,
        });

        // Update article verify count
        const article = await Article.findByIdAndUpdate(
            id,
            { $inc: { verifyCount: 1 } },
            { new: true }
        );

        if (!article) {
            return NextResponse.json(
                { ok: false, error: 'Article not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ok: true,
            data: {
                verifyCount: article.verifyCount,
            },
        });
    } catch (error) {
        console.error('Error voting on article:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to vote on article' },
            { status: 500 }
        );
    }
}

