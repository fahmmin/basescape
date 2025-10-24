import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Friendship from '@/models/Friendship';
import { normalizeSuiAddress } from '@/lib/auth';

// POST /api/friends/[id]/accept - Accept a friend request
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const body = await request.json();
        const { wallet } = body;

        if (!wallet) {
            return NextResponse.json(
                { ok: false, error: 'Wallet address required' },
                { status: 400 }
            );
        }

        const normalizedWallet = normalizeSuiAddress(wallet);

        // Find the friendship request
        const friendship = await Friendship.findById(id);

        if (!friendship) {
            return NextResponse.json(
                { ok: false, error: 'Friend request not found' },
                { status: 404 }
            );
        }

        // Verify this wallet is the recipient
        if (friendship.recipient !== normalizedWallet) {
            return NextResponse.json(
                { ok: false, error: 'Not authorized to accept this request' },
                { status: 403 }
            );
        }

        if (friendship.status !== 'pending') {
            return NextResponse.json(
                { ok: false, error: 'Request already processed' },
                { status: 400 }
            );
        }

        // Accept the request
        friendship.status = 'accepted';
        friendship.updatedAt = new Date();
        await friendship.save();

        return NextResponse.json({
            ok: true,
            data: friendship,
        });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to accept friend request' },
            { status: 500 }
        );
    }
}

