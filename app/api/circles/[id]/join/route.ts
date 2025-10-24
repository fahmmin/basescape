import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Circle from '@/models/Circle';
import { normalizeSuiAddress } from '@/lib/auth';

// POST /api/circles/[id]/join - Join a circle
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const body = await request.json();
        const { wallet } = body;

        if (!wallet) {
            return NextResponse.json(
                { ok: false, error: 'Wallet address required' },
                { status: 400 }
            );
        }

        const normalizedWallet = normalizeSuiAddress(wallet);

        const circle = await Circle.findById(id);

        if (!circle) {
            return NextResponse.json(
                { ok: false, error: 'Circle not found' },
                { status: 404 }
            );
        }

        // Check if already a member
        if (circle.members.includes(normalizedWallet)) {
            return NextResponse.json(
                { ok: false, error: 'Already a member' },
                { status: 400 }
            );
        }

        // Add to members
        circle.members.push(normalizedWallet);
        circle.updatedAt = new Date();
        await circle.save();

        return NextResponse.json({
            ok: true,
            data: circle,
        });
    } catch (error) {
        console.error('Error joining circle:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to join circle' },
            { status: 500 }
        );
    }
}

