import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Friendship from '@/models/Friendship';
import { normalizeSuiAddress } from '@/lib/auth';

// POST /api/friends/[id]/reject - Reject a friend request
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

        const friendship = await Friendship.findById(id);

        if (!friendship) {
            return NextResponse.json(
                { ok: false, error: 'Friend request not found' },
                { status: 404 }
            );
        }

        if (friendship.recipient !== normalizedWallet) {
            return NextResponse.json(
                { ok: false, error: 'Not authorized' },
                { status: 403 }
            );
        }

        // Delete the request
        await Friendship.findByIdAndDelete(id);

        return NextResponse.json({
            ok: true,
            data: { message: 'Request rejected' },
        });
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to reject friend request' },
            { status: 500 }
        );
    }
}

