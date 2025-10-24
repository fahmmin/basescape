import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import { normalizeSuiAddress } from '@/lib/auth';

// POST /api/messages - Send a message
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { conversationId, sender, content, attachments } = body;

        if (!conversationId || !sender || !content) {
            return NextResponse.json(
                { ok: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const normalizedSender = normalizeSuiAddress(sender);

        // Verify sender is a participant in the conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return NextResponse.json(
                { ok: false, error: 'Conversation not found' },
                { status: 404 }
            );
        }

        if (!conversation.participants.includes(normalizedSender)) {
            return NextResponse.json(
                { ok: false, error: 'Not a participant in this conversation' },
                { status: 403 }
            );
        }

        // Create message
        const message = await Message.create({
            conversationId,
            sender: normalizedSender,
            content: content.trim(),
            attachments: attachments || [],
            readBy: [normalizedSender], // Sender has "read" their own message
        });

        // Update conversation's last message
        conversation.lastMessage = {
            sender: normalizedSender,
            content: content.trim(),
            timestamp: message.createdAt,
        };

        // Increment unread count for all participants except sender
        for (const participant of conversation.participants) {
            if (participant !== normalizedSender) {
                const currentCount = conversation.unreadCount.get(participant) || 0;
                conversation.unreadCount.set(participant, currentCount + 1);
            }
        }

        conversation.updatedAt = new Date();
        await conversation.save();

        return NextResponse.json({
            ok: true,
            data: message,
        });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to send message' },
            { status: 500 }
        );
    }
}

// GET /api/messages - Get messages for a conversation
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get('conversationId');
        const limit = parseInt(searchParams.get('limit') || '100');

        if (!conversationId) {
            return NextResponse.json(
                { ok: false, error: 'Conversation ID required' },
                { status: 400 }
            );
        }

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 }) // Oldest first for chat display
            .limit(limit)
            .lean();

        return NextResponse.json({
            ok: true,
            data: messages,
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

