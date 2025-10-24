import { NextRequest, NextResponse } from 'next/server';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

// GET /api/nft/[objectId] - Fetch NFT data from Sui blockchain
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ objectId: string }> }
) {
    try {
        const { objectId } = await params;

        // Connect to Sui network
        const network = (process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet') as 'testnet' | 'mainnet';
        const client = new SuiClient({ url: getFullnodeUrl(network) });

        // Fetch object from Sui
        const object = await client.getObject({
            id: objectId,
            options: {
                showContent: true,
                showOwner: true,
                showType: true,
            },
        });

        if (!object.data) {
            return NextResponse.json(
                { ok: false, error: 'NFT not found on Sui' },
                { status: 404 }
            );
        }

        // Extract NFT data from content
        const content = object.data.content;
        if (content && 'fields' in content) {
            const fields = content.fields as Record<string, string | number | boolean>;

            return NextResponse.json({
                ok: true,
                data: {
                    objectId,
                    owner: object.data.owner,
                    fields: {
                        title: String(fields.title || ''),
                        city: String(fields.city || ''),
                        country: String(fields.country || ''),
                        blobId: String(fields.blob_id || ''),
                        imageUrl: String(fields.image_url || ''),
                        hypeScore: parseInt(String(fields.hype_score || '0')),
                        basePrice: parseInt(String(fields.base_price || '0')),
                        currentPrice: parseInt(String(fields.current_price || '0')),
                        forSale: Boolean(fields.for_sale),
                        evolutionLevel: parseInt(String(fields.evolution_level || '0')),
                        creator: String(fields.creator || ''),
                        owner: String(fields.owner || ''),
                    },
                },
            });
        }

        return NextResponse.json({
            ok: false,
            error: 'Invalid NFT structure',
        }, { status: 400 });
    } catch (error) {
        console.error('Error fetching NFT from Sui:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to fetch NFT data' },
            { status: 500 }
        );
    }
}

