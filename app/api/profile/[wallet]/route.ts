import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import CultureDrop from '@/models/CultureDrop';
import Article from '@/models/Article';
import { normalizeSuiAddress } from '@/lib/auth';

// GET /api/profile/[wallet] - Get user's drops and articles
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ wallet: string }> }
) {
    try {
        await connectDB();
        const { wallet } = await params;
        const normalizedWallet = normalizeSuiAddress(wallet);

        // Fetch user's drops
        const drops = await CultureDrop.find({ creatorWallet: normalizedWallet })
            .sort({ createdAt: -1 })
            .lean();

        // Fetch user's articles
        const articles = await Article.find({ author: normalizedWallet })
            .sort({ createdAt: -1 })
            .lean();

        // Calculate stats
        const totalVotes = drops.reduce((sum, drop) => sum + drop.voteCount, 0);
        const totalArticleVerifies = articles.reduce(
            (sum, article) => sum + article.verifyCount,
            0
        );
        const totalHype = drops.reduce((sum, drop) => sum + drop.hypeScore, 0);

        return NextResponse.json({
            ok: true,
            data: {
                wallet: normalizedWallet,
                drops,
                articles,
                stats: {
                    totalDrops: drops.length,
                    totalArticles: articles.length,
                    totalVotes,
                    totalArticleVerifies,
                    totalHype: parseFloat(totalHype.toFixed(2)),
                },
            },
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}

