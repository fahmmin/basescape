import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import CultureDrop from '@/models/CultureDrop';
import Article from '@/models/Article';
import { computeHype } from '@/lib/hype';
import { calculateLocationImpact } from '@/lib/hypeImpact';

// POST /api/drops/recalculate-hype - Recalculate hype scores with article impact
// This can be called periodically or after article creation/updates
export async function POST() {
    try {
        await connectDB();

        // Fetch all active articles with location links
        const articles = await Article.find({
            isActive: true,
            'linkedLocation.coordinates': { $exists: true },
        }).lean();

        // Fetch all drops
        const drops = await CultureDrop.find().lean();

        const updateOperations = [];

        for (const drop of drops) {
            // Calculate base hype score
            const baseHype = computeHype({
                upvotes: drop.voteCount,
                uniqueCommenters: drop.uniqueCommenters,
                createdAt: drop.createdAt,
            });

            // Calculate location impact from articles
            const locationImpact = calculateLocationImpact(
                drop.location.coordinates,
                articles as Array<{
                    impactTag: 'good' | 'bad' | 'worse';
                    impactMultiplier: number;
                    linkedLocation?: {
                        coordinates?: [number, number];
                        radius?: number;
                    };
                }>
            );

            // Apply location impact to hype score
            const adjustedHype = baseHype * locationImpact;

            updateOperations.push({
                updateOne: {
                    filter: { _id: drop._id },
                    update: {
                        $set: {
                            hypeScore: adjustedHype,
                        },
                    },
                },
            });
        }

        if (updateOperations.length > 0) {
            await CultureDrop.bulkWrite(updateOperations);
        }

        return NextResponse.json({
            ok: true,
            data: {
                dropsUpdated: updateOperations.length,
                articlesConsidered: articles.length,
            },
        });
    } catch (error) {
        console.error('Error recalculating hype:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to recalculate hype scores' },
            { status: 500 }
        );
    }
}

