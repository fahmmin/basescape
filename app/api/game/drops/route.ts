import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import CultureDrop from '@/models/CultureDrop';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const difficulty = searchParams.get('difficulty') || 'medium';

        await connectDB();

        // Define drop counts by difficulty
        const dropCounts = {
            easy: 6,
            medium: 8,
            hard: 12
        };

        const targetCount = dropCounts[difficulty as keyof typeof dropCounts] || 8;

        // Get culture drops with different strategies based on difficulty
        let drops;

        if (difficulty === 'easy') {
            // Easy: Only high hype drops (popular places)
            drops = await CultureDrop.aggregate([
                { $match: { hypeScore: { $gte: 10 } } },
                { $sample: { size: targetCount } },
                {
                    $project: {
                        title: 1,
                        city: 1,
                        country: 1,
                        hypeScore: 1,
                        voteCount: 1,
                        createdAt: 1
                    }
                }
            ]);
        } else if (difficulty === 'hard') {
            // Hard: Mix of all drops including low hype (rare finds)
            drops = await CultureDrop.aggregate([
                { $sample: { size: targetCount } },
                {
                    $project: {
                        title: 1,
                        city: 1,
                        country: 1,
                        hypeScore: 1,
                        voteCount: 1,
                        createdAt: 1
                    }
                }
            ]);
        } else {
            // Medium: Balanced mix
            drops = await CultureDrop.aggregate([
                { $sample: { size: targetCount } },
                {
                    $project: {
                        title: 1,
                        city: 1,
                        country: 1,
                        hypeScore: 1,
                        voteCount: 1,
                        createdAt: 1
                    }
                }
            ]);
        }

        // If we don't have enough drops, fill with fallback data
        if (drops.length < targetCount) {
            const fallbackDrops = [
                { title: 'Hauz Khas Village', city: 'Delhi', country: 'India', hypeScore: 15, voteCount: 8, createdAt: new Date() },
                { title: 'Marine Drive', city: 'Mumbai', country: 'India', hypeScore: 12, voteCount: 6, createdAt: new Date() },
                { title: 'Lalbagh Gardens', city: 'Bangalore', country: 'India', hypeScore: 8, voteCount: 4, createdAt: new Date() },
                { title: 'Red Fort', city: 'Delhi', country: 'India', hypeScore: 20, voteCount: 12, createdAt: new Date() },
                { title: 'Golden Temple', city: 'Amritsar', country: 'India', hypeScore: 18, voteCount: 10, createdAt: new Date() },
                { title: 'Gateway of India', city: 'Mumbai', country: 'India', hypeScore: 14, voteCount: 7, createdAt: new Date() },
                { title: 'Charminar', city: 'Hyderabad', country: 'India', hypeScore: 10, voteCount: 5, createdAt: new Date() },
                { title: 'Taj Mahal', city: 'Agra', country: 'India', hypeScore: 25, voteCount: 15, createdAt: new Date() },
                { title: 'Hawa Mahal', city: 'Jaipur', country: 'India', hypeScore: 9, voteCount: 3, createdAt: new Date() },
                { title: 'Victoria Memorial', city: 'Kolkata', country: 'India', hypeScore: 7, voteCount: 2, createdAt: new Date() },
                { title: 'Meenakshi Temple', city: 'Madurai', country: 'India', hypeScore: 11, voteCount: 4, createdAt: new Date() },
                { title: 'Konark Sun Temple', city: 'Puri', country: 'India', hypeScore: 6, voteCount: 1, createdAt: new Date() }
            ];

            // Add fallback drops to reach target count
            const needed = targetCount - drops.length;
            const selectedFallbacks = fallbackDrops.slice(0, needed);
            drops = [...drops, ...selectedFallbacks];
        }

        // Assign rarity based on hype score and vote count
        const dropsWithRarity = drops.map(drop => {
            const totalScore = (drop.hypeScore || 0) + (drop.voteCount || 0) * 2;

            let rarity = 'C'; // Common
            if (totalScore >= 30) rarity = 'SR'; // Super Rare
            else if (totalScore >= 20) rarity = 'R'; // Rare
            else if (totalScore >= 10) rarity = 'U'; // Uncommon

            return {
                ...drop,
                rarity,
                points: calculatePoints(rarity, totalScore)
            };
        });

        return NextResponse.json({
            ok: true,
            data: dropsWithRarity,
            difficulty,
            count: dropsWithRarity.length
        });

    } catch (error) {
        console.error('Failed to fetch culture drops:', error);

        // Fallback data when database fails
        const fallbackDrops = [
            { title: 'Hauz Khas Village', city: 'Delhi', country: 'India', rarity: 'R', points: 50, hypeScore: 15, voteCount: 8 },
            { title: 'Marine Drive', city: 'Mumbai', country: 'India', rarity: 'U', points: 30, hypeScore: 12, voteCount: 6 },
            { title: 'Lalbagh Gardens', city: 'Bangalore', country: 'India', rarity: 'C', points: 20, hypeScore: 8, voteCount: 4 },
            { title: 'Red Fort', city: 'Delhi', country: 'India', rarity: 'SR', points: 80, hypeScore: 20, voteCount: 12 },
            { title: 'Golden Temple', city: 'Amritsar', country: 'India', rarity: 'R', points: 60, hypeScore: 18, voteCount: 10 },
            { title: 'Gateway of India', city: 'Mumbai', country: 'India', rarity: 'U', points: 40, hypeScore: 14, voteCount: 7 }
        ];

        return NextResponse.json({
            ok: true,
            data: fallbackDrops,
            difficulty: 'medium',
            count: fallbackDrops.length,
            fallback: true
        });
    }
}

function calculatePoints(rarity: string, totalScore: number): number {
    const basePoints = {
        'C': 20,  // Common
        'U': 30,  // Uncommon  
        'R': 50,  // Rare
        'SR': 80  // Super Rare
    };

    const bonus = Math.floor(totalScore / 5);
    return basePoints[rarity as keyof typeof basePoints] + bonus;
}
