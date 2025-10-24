import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import CultureDrop from '@/models/CultureDrop';

// GET /api/drops/map - Get lightweight marker data for map display
export async function GET() {
    try {
        await connectDB();

        const drops = await CultureDrop.find()
            .select('_id title city country location media.url')
            .lean();

        // Format for map markers
        const markers = drops.map(drop => ({
            id: drop._id.toString(),
            title: drop.title,
            city: drop.city,
            country: drop.country,
            coordinates: drop.location.coordinates,
            imageUrl: drop.media.url,
        }));

        return NextResponse.json({
            ok: true,
            data: markers,
        });
    } catch (error) {
        console.error('Error fetching map data:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to fetch map data' },
            { status: 500 }
        );
    }
}

