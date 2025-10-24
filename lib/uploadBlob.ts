/**
 * Utility to upload files to Walrus using the existing publisher endpoint
 * Extracted from the original upload logic
 */

interface BlobEvent {
    txDigest: string;
    eventSeq: string;
}

interface BlobStorage {
    id: string;
    startEpoch: number;
    endEpoch: number;
    storageSize: number;
}

interface BlobObject {
    id: string;
    registeredEpoch: number;
    blobId: string;
    size: number;
    encodingType: string;
    certifiedEpoch: number;
    storage: BlobStorage;
    deletable: boolean;
}

interface PublisherResponse {
    newlyCreated?: {
        blobObject: BlobObject;
        resourceOperation: {
            registerFromScratch: {
                encodedLength: number;
                epochsAhead: number;
            };
        };
        cost: number;
    };
    alreadyCertified?: {
        blobId: string;
        event: BlobEvent;
        endEpoch: number;
    };
}

export interface WalrusUploadResult {
    blobId: string;
    url: string;
    walrusMeta?: {
        certificateId?: string;
        contentHash?: string;
        epochs?: number;
        publisherUrl?: string;
        aggregatorUrl?: string;
        suiObjectId?: string;
        endEpoch?: number;
    };
}

/**
 * Upload a file to Walrus and return the blob ID and read URL
 */
export async function uploadToWalrus(
    file: File,
    publisherUrl: string,
    aggregatorUrl: string,
    epochs: number = 53
): Promise<WalrusUploadResult> {
    try {
        const response = await fetch(`${publisherUrl}/v1/blobs?epochs=${epochs}`, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Length': file.size.toString(),
                'Content-Type': file.type || 'application/octet-stream',
            },
        });

        if (!response.ok) {
            throw new Error(`Upload failed with status: ${response.status}`);
        }

        const publisherData = (await response.json()) as PublisherResponse;

        let blobId: string;
        let walrusMeta: WalrusUploadResult['walrusMeta'] = {};

        if (publisherData.newlyCreated) {
            blobId = publisherData.newlyCreated.blobObject.blobId;
            walrusMeta = {
                suiObjectId: publisherData.newlyCreated.blobObject.id,
                endEpoch: publisherData.newlyCreated.blobObject.storage.endEpoch,
                epochs: publisherData.newlyCreated.blobObject.storage.endEpoch -
                    publisherData.newlyCreated.blobObject.storage.startEpoch,
                certificateId: publisherData.newlyCreated.blobObject.id,
                publisherUrl,
                aggregatorUrl,
            };
        } else if (publisherData.alreadyCertified) {
            blobId = publisherData.alreadyCertified.blobId;
            walrusMeta = {
                endEpoch: publisherData.alreadyCertified.endEpoch,
                publisherUrl,
                aggregatorUrl,
            };
        } else {
            throw new Error('Invalid response format from Walrus publisher');
        }

        const url = `${aggregatorUrl}/v1/blobs/${blobId}`;

        return {
            blobId,
            url,
            walrusMeta,
        };
    } catch (error) {
        throw new Error(
            `Failed to upload to Walrus: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

