import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Conversation from '@/models/Conversation';
import { normalizeSuiAddress } from '@/lib/auth';

// POST /api/messages/mark-read - Mark conversation as read
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { conversationId, wallet } = body;

        if (!conversationId || !wallet) {
            return NextResponse.json(
                { ok: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const normalizedWallet = normalizeSuiAddress(wallet);

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return NextResponse.json(
                { ok: false, error: 'Conversation not found' },
                { status: 404 }
            );
        }

        // Reset unread count for this user
        conversation.unreadCount.set(normalizedWallet, 0);
        await conversation.save();

        return NextResponse.json({
            ok: true,
            data: { message: 'Marked as read' },
        });
    } catch (error) {
        console.error('Error marking as read:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to mark as read' },
            { status: 500 }
        );
    }
}

