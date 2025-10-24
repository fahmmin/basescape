import { NextRequest, NextResponse } from 'next/server';
import { getNFTData } from '@/lib/baseContract';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tokenId: string }> }
) {
    try {
        const { tokenId: tokenIdStr } = await params;
        const tokenId = parseInt(tokenIdStr);

        if (isNaN(tokenId)) {
            return NextResponse.json(
                { ok: false, error: 'Invalid token ID' },
                { status: 400 }
            );
        }

        // Fetch NFT data from Base contract
        const nftData = await getNFTData(tokenId);

        return NextResponse.json({
            ok: true,
            data: {
                tokenId,
                title: nftData.title,
                caption: nftData.caption,
                city: nftData.city,
                country: nftData.country,
                blobId: nftData.blobId,
                imageUrl: nftData.imageUrl,
                dropId: nftData.dropId,
                longitude: nftData.longitude,
                latitude: nftData.latitude,
                hypeScore: nftData.hypeScore.toString(),
                voteCount: nftData.voteCount.toString(),
                commentCount: nftData.commentCount.toString(),
                evolutionLevel: nftData.evolutionLevel,
                creator: nftData.creator,
                mintedAt: nftData.mintedAt.toString(),
                basePrice: nftData.basePrice.toString(),
                currentPrice: nftData.currentPrice.toString(),
                forSale: nftData.forSale,
                hypeMultiplier: nftData.hypeMultiplier.toString(),
            },
        });
    } catch (error) {
        console.error('Error fetching NFT data:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to fetch NFT data' },
            { status: 500 }
        );
    }
}
