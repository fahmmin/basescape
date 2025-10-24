import mongoose, { Schema, models, model, Document } from 'mongoose';

const MessageSchema = new Schema({
    conversationId: { type: String, required: true, index: true },
    sender: { type: String, required: true, index: true }, // Wallet address
    content: { type: String, required: true },

    // Optional: Attachments (Walrus blobs)
    attachments: [
        {
            blobId: { type: String },
            url: { type: String },
            type: { type: String }, // 'image', 'video', 'file'
        },
    ],

    // Read tracking
    readBy: [{ type: String }], // Array of wallet addresses that read this

    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
});

// Indexes
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, createdAt: -1 });

export interface IMessage extends Document {
    conversationId: string;
    sender: string;
    content: string;
    attachments?: Array<{
        blobId?: string;
        url?: string;
        type?: string;
    }>;
    readBy: string[];
    createdAt: Date;
    updatedAt: Date;
}

export default (models.Message as mongoose.Model<IMessage>) ||
    model<IMessage>('Message', MessageSchema);

