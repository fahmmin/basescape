import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import CultureDrop from '@/models/CultureDrop';
import Comment from '@/models/Comment';

// GET /api/drops/[id] - Get a single drop with comments
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const drop = await CultureDrop.findById(id).lean();

        if (!drop) {
            return NextResponse.json(
                { ok: false, error: 'Drop not found' },
                { status: 404 }
            );
        }

        // Fetch comments for this drop
        const comments = await Comment.find({ postId: id })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        return NextResponse.json({
            ok: true,
            data: {
                drop,
                comments,
            },
        });
    } catch (error) {
        console.error('Error fetching drop:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to fetch drop' },
            { status: 500 }
        );
    }
}

