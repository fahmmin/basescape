import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Circle from '@/models/Circle';
import { normalizeSuiAddress } from '@/lib/auth';

// POST /api/circles/[id]/leave - Leave a circle
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

        // Can't leave if you're the admin (must delete circle instead)
        if (circle.admin === normalizedWallet) {
            return NextResponse.json(
                { ok: false, error: 'Admin cannot leave. Delete the circle instead.' },
                { status: 400 }
            );
        }

        // Remove from members
        circle.members = circle.members.filter((m) => m !== normalizedWallet);
        circle.updatedAt = new Date();
        await circle.save();

        return NextResponse.json({
            ok: true,
            data: { message: 'Left circle successfully' },
        });
    } catch (error) {
        console.error('Error leaving circle:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to leave circle' },
            { status: 500 }
        );
    }
}

