import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import CultureDrop from '@/models/CultureDrop';

// GET /api/drops/[id]/walrus - Get Walrus metadata for a drop
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const drop = await CultureDrop.findById(id).select('walrus media').lean();

        if (!drop) {
            return NextResponse.json(
                { ok: false, error: 'Drop not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ok: true,
            data: {
                blobId: drop.media.blobId,
                url: drop.media.url,
                ...drop.walrus,
            },
        });
    } catch (error) {
        console.error('Error fetching Walrus metadata:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to fetch Walrus metadata' },
            { status: 500 }
        );
    }
}

