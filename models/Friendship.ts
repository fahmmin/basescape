import mongoose, { Schema, models, model, Document } from 'mongoose';

const FriendshipSchema = new Schema({
    requester: { type: String, required: true, index: true }, // Sui wallet address
    recipient: { type: String, required: true, index: true }, // Sui wallet address
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'blocked'],
        default: 'pending',
        index: true,
    },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
});

// Compound indexes for efficient queries
FriendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });
FriendshipSchema.index({ requester: 1, status: 1 });
FriendshipSchema.index({ recipient: 1, status: 1 });

export interface IFriendship extends Document {
    requester: string;
    recipient: string;
    status: 'pending' | 'accepted' | 'rejected' | 'blocked';
    createdAt: Date;
    updatedAt: Date;
}

export default (models.Friendship as mongoose.Model<IFriendship>) ||
    model<IFriendship>('Friendship', FriendshipSchema);

