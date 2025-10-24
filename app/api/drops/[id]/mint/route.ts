import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import CultureDrop from '@/models/CultureDrop';
import { normalizeSuiAddress } from '@/lib/auth';

// POST /api/drops/[id]/mint - Save NFT minting data
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const body = await request.json();
        const { tokenId, contractAddress, txHash, wallet } = body;

        if (!tokenId || !contractAddress || !txHash || !wallet) {
            return NextResponse.json(
                { ok: false, error: 'Missing required NFT data' },
                { status: 400 }
            );
        }

        const normalizedWallet = wallet.toLowerCase();

        // Find the drop
        const drop = await CultureDrop.findById(id);

        if (!drop) {
            return NextResponse.json(
                { ok: false, error: 'Drop not found' },
                { status: 404 }
            );
        }

        // Check if already minted
        if (drop.nft?.isMinted) {
            return NextResponse.json(
                { ok: false, error: 'Drop already minted as NFT' },
                { status: 400 }
            );
        }

        // Update drop with NFT data
        drop.nft = {
            tokenId,
            contractAddress,
            mintedAt: new Date(),
            mintedBy: normalizedWallet,
            txHash,
            isMinted: true,
        };

        await drop.save();

        return NextResponse.json({
            ok: true,
            data: {
                nft: drop.nft,
            },
        });
    } catch (error) {
        console.error('Error saving NFT data:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to save NFT data' },
            { status: 500 }
        );
    }
}

// GET /api/drops/[id]/mint - Get NFT status
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const drop = await CultureDrop.findById(id).select('nft').lean();

        if (!drop) {
            return NextResponse.json(
                { ok: false, error: 'Drop not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ok: true,
            data: {
                isMinted: drop.nft?.isMinted || false,
                nft: drop.nft || null,
            },
        });
    } catch (error) {
        console.error('Error fetching NFT status:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to fetch NFT status' },
            { status: 500 }
        );
    }
}

