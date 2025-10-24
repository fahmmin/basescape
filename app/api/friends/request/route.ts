import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Friendship from '@/models/Friendship';
import { verifySuiSignature, normalizeSuiAddress } from '@/lib/auth';
import { messageFor } from '@/lib/crypto';

// POST /api/friends/request - Send a friend request
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { recipient, signature, wallet } = body;

        if (!recipient || !signature || !wallet) {
            return NextResponse.json(
                { ok: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify signature
        const message = messageFor('create'); // Reuse create message
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

        const normalizedRequester = normalizeSuiAddress(wallet);
        const normalizedRecipient = normalizeSuiAddress(recipient);

        // Can't friend yourself
        if (normalizedRequester === normalizedRecipient) {
            return NextResponse.json(
                { ok: false, error: 'Cannot send friend request to yourself' },
                { status: 400 }
            );
        }

        // Check if friendship already exists
        const existing = await Friendship.findOne({
            $or: [
                { requester: normalizedRequester, recipient: normalizedRecipient },
                { requester: normalizedRecipient, recipient: normalizedRequester },
            ],
        });

        if (existing) {
            if (existing.status === 'accepted') {
                return NextResponse.json(
                    { ok: false, error: 'Already friends' },
                    { status: 400 }
                );
            }
            if (existing.status === 'pending') {
                return NextResponse.json(
                    { ok: false, error: 'Friend request already pending' },
                    { status: 400 }
                );
            }
        }

        // Create friend request
        const friendship = await Friendship.create({
            requester: normalizedRequester,
            recipient: normalizedRecipient,
            status: 'pending',
        });

        return NextResponse.json({
            ok: true,
            data: friendship,
        });
    } catch (error) {
        console.error('Error sending friend request:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to send friend request' },
            { status: 500 }
        );
    }
}

