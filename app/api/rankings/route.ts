import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import CultureDrop from '@/models/CultureDrop';

// GET /api/rankings - Get top drops by hype score
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');

        const drops = await CultureDrop.find()
            .sort({ hypeScore: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({
            ok: true,
            data: drops,
        });
    } catch (error) {
        console.error('Error fetching rankings:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to fetch rankings' },
            { status: 500 }
        );
    }
}

