import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Friendship from '@/models/Friendship';
import { normalizeSuiAddress } from '@/lib/auth';

// GET /api/friends - Get user's friends and pending requests
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const wallet = searchParams.get('wallet');

        if (!wallet) {
            return NextResponse.json(
                { ok: false, error: 'Wallet address required' },
                { status: 400 }
            );
        }

        const normalizedWallet = normalizeSuiAddress(wallet);

        // Get accepted friendships (bidirectional)
        const friends = await Friendship.find({
            $or: [
                { requester: normalizedWallet, status: 'accepted' },
                { recipient: normalizedWallet, status: 'accepted' },
            ],
        }).lean();

        // Get pending requests (received)
        const pendingRequests = await Friendship.find({
            recipient: normalizedWallet,
            status: 'pending',
        }).lean();

        // Get sent requests (waiting for response)
        const sentRequests = await Friendship.find({
            requester: normalizedWallet,
            status: 'pending',
        }).lean();

        return NextResponse.json({
            ok: true,
            data: {
                friends: friends.map((f) => ({
                    ...f,
                    friendWallet:
                        f.requester === normalizedWallet ? f.recipient : f.requester,
                })),
                pendingRequests,
                sentRequests,
            },
        });
    } catch (error) {
        console.error('Error fetching friends:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to fetch friends' },
            { status: 500 }
        );
    }
}

