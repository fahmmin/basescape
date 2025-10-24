import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import CultureDrop from '@/models/CultureDrop';

// GET /api/drops/search - Search drops by title, city, or country
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const limit = parseInt(searchParams.get('limit') || '50');

        if (!query.trim()) {
            return NextResponse.json({
                ok: true,
                data: [],
            });
        }

        // Case-insensitive regex search
        const searchRegex = new RegExp(query.trim(), 'i');

        const drops = await CultureDrop.find({
            $or: [
                { title: searchRegex },
                { city: searchRegex },
                { country: searchRegex },
                { caption: searchRegex },
            ],
        })
            .sort({ hypeScore: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({
            ok: true,
            data: drops,
        });
    } catch (error) {
        console.error('Error searching drops:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to search drops' },
            { status: 500 }
        );
    }
}

