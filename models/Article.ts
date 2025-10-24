import mongoose, { Schema, models, model, Document } from 'mongoose';

// Article schema with Walrus content storage
const ArticleSchema = new Schema({
    // Article metadata
    title: { type: String, required: true, index: true },
    author: { type: String, required: true }, // Sui wallet address

    // Walrus blob pointers
    thumbnailBlob: {
        blobId: { type: String, required: true },
        url: { type: String, required: true },
    },

    contentBlob: {
        blobId: { type: String, required: true },
        url: { type: String, required: true },
    },

    // Location linking (optional)
    linkedLocation: {
        city: { type: String },
        country: { type: String },
        coordinates: { type: [Number] }, // [lng, lat]
        radius: { type: Number, default: 5000 }, // Impact radius in meters (default 5km)
    },

    // Article tag affecting hype
    impactTag: {
        type: String,
        enum: ['good', 'bad', 'worse'],
        required: true,
    },

    // Impact multiplier on nearby drops
    impactMultiplier: {
        type: Number,
        default: function () {
            switch (this.impactTag) {
                case 'good': return 1.2; // Boost nearby drops by 20%
                case 'bad': return 0.8;  // Reduce by 20%
                case 'worse': return 0.5; // Reduce by 50%
                default: return 1.0;
            }
        },
    },

    // Engagement metrics
    verifyCount: { type: Number, default: 0 }, // Upvotes
    viewCount: { type: Number, default: 0 },

    // Walrus metadata
    walrus: {
        thumbnailCertId: { type: String },
        contentCertId: { type: String },
        publisherUrl: { type: String },
        aggregatorUrl: { type: String },
    },

    // Status
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
});

// Index for location-based queries
ArticleSchema.index({ 'linkedLocation.coordinates': '2dsphere' });

// Index for sorting by verify count
ArticleSchema.index({ verifyCount: -1 });

export interface IArticle extends Document {
    title: string;
    author: string;
    thumbnailBlob: {
        blobId: string;
        url: string;
    };
    contentBlob: {
        blobId: string;
        url: string;
    };
    linkedLocation?: {
        city?: string;
        country?: string;
        coordinates?: [number, number];
        radius?: number;
    };
    impactTag: 'good' | 'bad' | 'worse';
    impactMultiplier: number;
    verifyCount: number;
    viewCount: number;
    walrus?: {
        thumbnailCertId?: string;
        contentCertId?: string;
        publisherUrl?: string;
        aggregatorUrl?: string;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export default (models.Article as mongoose.Model<IArticle>) ||
    model<IArticle>('Article', ArticleSchema);

