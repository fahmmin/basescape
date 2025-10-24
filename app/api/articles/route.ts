import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Article from '@/models/Article';
import { verifySuiSignature, normalizeSuiAddress } from '@/lib/auth';
import { messageFor } from '@/lib/crypto';

// POST /api/articles - Create a new article
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const {
            title,
            thumbnailBlob,
            contentBlob,
            linkedLocation,
            impactTag,
            walrus,
            signature,
            wallet,
        } = body;

        // Validate required fields
        if (!title || !thumbnailBlob || !contentBlob || !impactTag || !signature || !wallet) {
            return NextResponse.json(
                { ok: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate impact tag
        if (!['good', 'bad', 'worse'].includes(impactTag)) {
            return NextResponse.json(
                { ok: false, error: 'Invalid impact tag. Must be: good, bad, or worse' },
                { status: 400 }
            );
        }

        // Verify signature
        const message = messageFor('create');
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

        // Normalize wallet address
        const normalizedWallet = normalizeSuiAddress(wallet);

        // Calculate impact multiplier based on tag
        let impactMultiplier = 1.0;
        switch (impactTag) {
            case 'good':
                impactMultiplier = 1.2;
                break;
            case 'bad':
                impactMultiplier = 0.8;
                break;
            case 'worse':
                impactMultiplier = 0.5;
                break;
        }

        // Create the article
        const article = await Article.create({
            title,
            author: normalizedWallet,
            thumbnailBlob: {
                blobId: thumbnailBlob.blobId,
                url: thumbnailBlob.url,
            },
            contentBlob: {
                blobId: contentBlob.blobId,
                url: contentBlob.url,
            },
            linkedLocation: linkedLocation || undefined,
            impactTag,
            impactMultiplier,
            walrus: walrus || {},
        });

        return NextResponse.json({
            ok: true,
            data: article,
        });
    } catch (error) {
        console.error('Error creating article:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to create article' },
            { status: 500 }
        );
    }
}

// GET /api/articles - List all articles
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const sort = searchParams.get('sort') || 'new';
        const limit = parseInt(searchParams.get('limit') || '50');

        let sortQuery = {};
        if (sort === 'new') {
            sortQuery = { createdAt: -1 };
        } else if (sort === 'popular') {
            sortQuery = { verifyCount: -1 };
        } else if (sort === 'views') {
            sortQuery = { viewCount: -1 };
        }

        const articles = await Article.find({ isActive: true })
            .sort(sortQuery)
            .limit(limit)
            .lean();

        return NextResponse.json({
            ok: true,
            data: articles,
        });
    } catch (error) {
        console.error('Error fetching articles:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to fetch articles' },
            { status: 500 }
        );
    }
}

