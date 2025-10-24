import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Conversation from '@/models/Conversation';
import { normalizeSuiAddress } from '@/lib/auth';

// GET /api/conversations - Get user's conversations
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

        // Get all conversations where user is a participant
        const conversations = await Conversation.find({
            participants: normalizedWallet,
        })
            .sort({ 'lastMessage.timestamp': -1 })
            .lean();

        return NextResponse.json({
            ok: true,
            data: conversations,
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to fetch conversations' },
            { status: 500 }
        );
    }
}

// POST /api/conversations - Create or get existing conversation
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { participants, type, circleId, name } = body;

        if (!participants || !type) {
            return NextResponse.json(
                { ok: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const normalizedParticipants = participants.map((p: string) =>
            normalizeSuiAddress(p)
        );

        // For DM, check if conversation already exists
        if (type === 'dm' && normalizedParticipants.length === 2) {
            const existing = await Conversation.findOne({
                type: 'dm',
                participants: { $all: normalizedParticipants },
            });

            if (existing) {
                return NextResponse.json({
                    ok: true,
                    data: existing,
                });
            }
        }

        // Create new conversation
        const conversation = await Conversation.create({
            type,
            participants: normalizedParticipants,
            circleId,
            name,
            unreadCount: new Map(),
        });

        return NextResponse.json({
            ok: true,
            data: conversation,
        });
    } catch (error) {
        console.error('Error creating conversation:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to create conversation' },
            { status: 500 }
        );
    }
}

