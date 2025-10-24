import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import CultureDrop from '@/models/CultureDrop';
import Comment from '@/models/Comment';
import { limitIp } from '@/lib/ratelimit';
import { computeHype } from '@/lib/hype';

// POST /api/drops/[id]/comment - Add a comment/review
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const body = await request.json();
        const { text, pseudo } = body;

        if (!text || !pseudo) {
            return NextResponse.json(
                { ok: false, error: 'Missing text or pseudo' },
                { status: 400 }
            );
        }

        // Rate limit by IP
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        if (!limitIp(ip, 10_000)) {
            return NextResponse.json(
                { ok: false, error: 'Too many requests, please wait' },
                { status: 429 }
            );
        }

        // Create comment
        const comment = await Comment.create({
            postId: id,
            text: text.trim().slice(0, 500), // Limit to 500 chars
            pseudo: pseudo.trim().slice(0, 50), // Limit to 50 chars
        });

        // Update drop's unique commenter count and hype score
        const drop = await CultureDrop.findById(id);
        if (!drop) {
            return NextResponse.json(
                { ok: false, error: 'Drop not found' },
                { status: 404 }
            );
        }

        // Count unique commenters
        const uniqueCommenters = await Comment.distinct('pseudo', { postId: id });
        drop.uniqueCommenters = uniqueCommenters.length;

        drop.hypeScore = computeHype({
            upvotes: drop.voteCount,
            uniqueCommenters: drop.uniqueCommenters,
            createdAt: drop.createdAt,
        });

        await drop.save();

        return NextResponse.json({
            ok: true,
            data: comment,
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to create comment' },
            { status: 500 }
        );
    }
}

