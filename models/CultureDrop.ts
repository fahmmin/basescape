import mongoose, { Schema, models, model, Document } from 'mongoose';

// Sub-schema for blob pointers
const BlobPointer = new Schema(
    {
        blobId: { type: String, required: true },
        url: { type: String, required: true },
    },
    { _id: false }
);

// Main Culture Drop schema
const CultureDropSchema = new Schema({
    creatorWallet: { type: String, index: true, required: true },
    title: { type: String, required: true },
    caption: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },

    // GeoJSON for map queries
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },

    // Walrus blob references
    media: { type: BlobPointer, required: true }, // Image blob
    metadata: { type: BlobPointer, required: false }, // Optional JSON blob

    // Privacy settings
    visibility: {
        type: String,
        enum: ['public', 'friends', 'circle'],
        default: 'public',
    },
    allowedCircles: [{ type: String }], // Circle IDs that can view this drop

    // Engagement metrics
    hypeScore: { type: Number, default: 0, index: true },
    voteCount: { type: Number, default: 0 },
    uniqueCommenters: { type: Number, default: 0 },

    // Walrus metadata (v3)
    walrus: {
        certificateId: { type: String },
        contentHash: { type: String },
        epochs: { type: Number },
        publisherUrl: { type: String },
        aggregatorUrl: { type: String },
        suiObjectId: { type: String },
        endEpoch: { type: Number },
    },

    // NFT metadata (v4 - optional)
    nft: {
        objectId: { type: String },      // Sui NFT object ID
        packageId: { type: String },     // Contract package ID
        marketplaceId: { type: String }, // Marketplace object ID
        mintedAt: { type: Date },        // When NFT was minted
        mintedBy: { type: String },      // Wallet that minted
        txDigest: { type: String },      // Transaction hash
        isMinted: { type: Boolean, default: false },
    },

    createdAt: { type: Date, default: () => new Date() },
});

// Create geospatial index for location queries
CultureDropSchema.index({ location: '2dsphere' });

// Index for sorting by hype score
CultureDropSchema.index({ hypeScore: -1 });

// Index for sorting by creation date
CultureDropSchema.index({ createdAt: -1 });

export interface ICultureDrop extends Document {
    creatorWallet: string;
    title: string;
    caption: string;
    city: string;
    country: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    media: {
        blobId: string;
        url: string;
    };
    metadata?: {
        blobId: string;
        url: string;
    };
    hypeScore: number;
    voteCount: number;
    uniqueCommenters: number;
    walrus?: {
        certificateId?: string;
        contentHash?: string;
        epochs?: number;
        publisherUrl?: string;
        aggregatorUrl?: string;
        suiObjectId?: string;
        endEpoch?: number;
    };
    nft?: {
        objectId?: string;
        packageId?: string;
        marketplaceId?: string;
        mintedAt?: Date;
        mintedBy?: string;
        txDigest?: string;
        isMinted?: boolean;
    };
    createdAt: Date;
}

export default (models.CultureDrop as mongoose.Model<ICultureDrop>) ||
    model<ICultureDrop>('CultureDrop', CultureDropSchema);

