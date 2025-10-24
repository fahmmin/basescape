import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Article from '@/models/Article';

// GET /api/articles/[id] - Get a single article and increment view count
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const article = await Article.findById(id).lean();

        if (!article) {
            return NextResponse.json(
                { ok: false, error: 'Article not found' },
                { status: 404 }
            );
        }

        // Increment view count
        await Article.findByIdAndUpdate(id, {
            $inc: { viewCount: 1 },
        });

        // Fetch content from Walrus blob
        // Note: The client will fetch the actual content from contentBlob.url
        // We just return the metadata here

        return NextResponse.json({
            ok: true,
            data: {
                ...article,
                viewCount: (article.viewCount || 0) + 1,
            },
        });
    } catch (error) {
        console.error('Error fetching article:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to fetch article' },
            { status: 500 }
        );
    }
}

