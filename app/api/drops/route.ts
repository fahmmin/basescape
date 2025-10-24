import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import CultureDrop from '@/models/CultureDrop';
import { verifySuiSignature, normalizeSuiAddress } from '@/lib/auth';
import { messageFor } from '@/lib/crypto';
import { computeHype } from '@/lib/hype';

// POST /api/drops - Create a new culture drop
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const {
            title,
            caption,
            city,
            country,
            lng,
            lat,
            media,
            walrus,
            signature,
            wallet,
        } = body;

        // Validate required fields
        if (!title || !caption || !city || !country || lng === undefined || lat === undefined || !media || !signature || !wallet) {
            return NextResponse.json(
                { ok: false, error: 'Missing required fields' },
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

        // Calculate initial hype score
        const now = new Date();
        const hypeScore = computeHype({
            upvotes: 0,
            uniqueCommenters: 0,
            createdAt: now,
        });

        // Create the drop
        const drop = await CultureDrop.create({
            creatorWallet: normalizedWallet,
            title,
            caption,
            city,
            country,
            location: {
                type: 'Point',
                coordinates: [lng, lat],
            },
            media: {
                blobId: media.blobId,
                url: media.url,
            },
            walrus: walrus || {},
            hypeScore,
            createdAt: now,
        });

        return NextResponse.json({
            ok: true,
            data: drop,
        });
    } catch (error) {
        console.error('Error creating drop:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to create drop' },
            { status: 500 }
        );
    }
}

// GET /api/drops - List all drops (sorted by newest or hype)
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const sort = searchParams.get('sort') || 'new';
        const limit = parseInt(searchParams.get('limit') || '100');

        let sortQuery = {};
        if (sort === 'new') {
            sortQuery = { createdAt: -1 };
        } else if (sort === 'hype') {
            sortQuery = { hypeScore: -1 };
        }

        const drops = await CultureDrop.find()
            .sort(sortQuery)
            .limit(limit)
            .lean();

        return NextResponse.json({
            ok: true,
            data: drops,
        });
    } catch (error) {
        console.error('Error fetching drops:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to fetch drops' },
            { status: 500 }
        );
    }
}

