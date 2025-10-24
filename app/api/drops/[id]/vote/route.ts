import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import CultureDrop from '@/models/CultureDrop';
import Vote from '@/models/Vote';
import { verifySuiSignature, normalizeSuiAddress } from '@/lib/auth';
import { messageFor, voteHash } from '@/lib/crypto';
import { computeHype } from '@/lib/hype';

const SERVER_SALT = process.env.SERVER_SALT || 'default-salt-change-in-production';

// POST /api/drops/[id]/vote - Upvote a drop
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const body = await request.json();
        const { signature, wallet } = body;

        if (!signature || !wallet) {
            return NextResponse.json(
                { ok: false, error: 'Missing signature or wallet' },
                { status: 400 }
            );
        }

        // Verify signature
        const message = messageFor('vote', id);
        const isValid = await verifySuiSignature({
            message,
            signature,
            address: wallet,
        });

        if (!isValid) {
            return NextResponse.json(
                { ok: false, error: 'Invalid signature' },
                { status: 401 }
            );
        }

        // Normalize wallet
        const normalizedWallet = normalizeSuiAddress(wallet);

        // Generate vote hash
        const hash = voteHash({
            wallet: normalizedWallet,
            postId: id,
            serverSalt: SERVER_SALT,
        });

        // Check if already voted
        const existingVote = await Vote.findOne({ voteHash: hash });
        if (existingVote) {
            return NextResponse.json(
                { ok: false, error: 'Already voted' },
                { status: 400 }
            );
        }

        // Create vote
        await Vote.create({
            postId: id,
            voteHash: hash,
        });

        // Update drop vote count and hype score
        const drop = await CultureDrop.findById(id);
        if (!drop) {
            return NextResponse.json(
                { ok: false, error: 'Drop not found' },
                { status: 404 }
            );
        }

        drop.voteCount += 1;

        // Calculate base hype
        const baseHype = computeHype({
            upvotes: drop.voteCount,
            uniqueCommenters: drop.uniqueCommenters,
            createdAt: drop.createdAt,
        });

        // Apply location impact from articles (if any)
        const Article = (await import('@/models/Article')).default;
        const { calculateLocationImpact } = await import('@/lib/hypeImpact');

        const articles = await Article.find({
            isActive: true,
            'linkedLocation.coordinates': { $exists: true },
        }).lean();

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

        drop.hypeScore = baseHype * locationImpact;

        await drop.save();

        return NextResponse.json({
            ok: true,
            data: {
                voteCount: drop.voteCount,
                hypeScore: drop.hypeScore,
            },
        });
    } catch (error) {
        console.error('Error voting:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to vote' },
            { status: 500 }
        );
    }
}

