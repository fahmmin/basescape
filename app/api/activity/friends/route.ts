import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import CultureDrop from '@/models/CultureDrop';
import Article from '@/models/Article';
import Friendship from '@/models/Friendship';
import { normalizeSuiAddress } from '@/lib/auth';

// GET /api/activity/friends - Get activity from friends
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const wallet = searchParams.get('wallet');
        const limit = parseInt(searchParams.get('limit') || '20');

        if (!wallet) {
            return NextResponse.json(
                { ok: false, error: 'Wallet address required' },
                { status: 400 }
            );
        }

        const normalizedWallet = normalizeSuiAddress(wallet);

        // Get user's friends
        const friendships = await Friendship.find({
            $or: [
                { requester: normalizedWallet, status: 'accepted' },
                { recipient: normalizedWallet, status: 'accepted' },
            ],
        }).lean();

        // Extract friend wallet addresses
        const friendWallets = friendships.map((f) =>
            f.requester === normalizedWallet ? f.recipient : f.requester
        );

        if (friendWallets.length === 0) {
            return NextResponse.json({
                ok: true,
                data: [],
            });
        }

        // Get recent drops from friends
        const friendDrops = await CultureDrop.find({
            creatorWallet: { $in: friendWallets },
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Get recent articles from friends
        const friendArticles = await Article.find({
            author: { $in: friendWallets },
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Combine and sort by date
        const combined = [
            ...friendDrops.map((d) => ({ ...d, type: 'drop' })),
            ...friendArticles.map((a) => ({ ...a, type: 'article' })),
        ]
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .slice(0, limit);

        return NextResponse.json({
            ok: true,
            data: combined,
        });
    } catch (error) {
        console.error('Error fetching friend activity:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to fetch friend activity' },
            { status: 500 }
        );
    }
}

