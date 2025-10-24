import mongoose, { Schema, models, model, Document } from 'mongoose';

const CircleSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    admin: { type: String, required: true, index: true }, // Creator wallet
    members: [{ type: String }], // Array of wallet addresses
    isPrivate: { type: Boolean, default: true },

    // Optional: Circle avatar stored on Walrus
    avatar: {
        blobId: { type: String },
        url: { type: String },
    },

    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
});

// Indexes
CircleSchema.index({ admin: 1 });
CircleSchema.index({ members: 1 });
CircleSchema.index({ createdAt: -1 });

export interface ICircle extends Document {
    name: string;
    description?: string;
    admin: string;
    members: string[];
    isPrivate: boolean;
    avatar?: {
        blobId?: string;
        url?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

export default (models.Circle as mongoose.Model<ICircle>) ||
    model<ICircle>('Circle', CircleSchema);

