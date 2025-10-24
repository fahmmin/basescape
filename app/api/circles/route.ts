import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Circle from '@/models/Circle';
import { verifySuiSignature, normalizeSuiAddress } from '@/lib/auth';
import { messageFor } from '@/lib/crypto';

// POST /api/circles - Create a new circle
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { name, description, isPrivate, signature, wallet } = body;

        if (!name || !signature || !wallet) {
            return NextResponse.json(
                { ok: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify signature
        const message = messageFor('create');
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

        const normalizedWallet = normalizeSuiAddress(wallet);

        // Create circle with admin as first member
        const circle = await Circle.create({
            name: name.trim(),
            description: description?.trim() || '',
            admin: normalizedWallet,
            members: [normalizedWallet], // Admin is auto-member
            isPrivate: isPrivate !== undefined ? isPrivate : true,
        });

        return NextResponse.json({
            ok: true,
            data: circle,
        });
    } catch (error) {
        console.error('Error creating circle:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to create circle' },
            { status: 500 }
        );
    }
}

// GET /api/circles - Get user's circles
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const wallet = searchParams.get('wallet');

        if (!wallet) {
            return NextResponse.json(
                { ok: false, error: 'Wallet address required' },
                { status: 400 }
            );
        }

        const normalizedWallet = normalizeSuiAddress(wallet);

        // Get circles where user is a member
        const circles = await Circle.find({
            members: normalizedWallet,
        })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            ok: true,
            data: circles,
        });
    } catch (error) {
        console.error('Error fetching circles:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to fetch circles' },
            { status: 500 }
        );
    }
}

