import mongoose, { Schema, models, model, Document } from 'mongoose';

const ConversationSchema = new Schema({
    type: {
        type: String,
        enum: ['dm', 'circle', 'group'],
        required: true,
    },

    // Participants (for DM and groups)
    participants: [{ type: String }], // Wallet addresses

    // For circle chats
    circleId: { type: String },

    // Conversation metadata
    name: { type: String }, // For group chats
    lastMessage: {
        sender: { type: String },
        content: { type: String },
        timestamp: { type: Date },
    },

    // Unread tracking per user
    unreadCount: {
        type: Map,
        of: Number, // wallet -> count
    },

    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
});

// Indexes
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ circleId: 1 });
ConversationSchema.index({ 'lastMessage.timestamp': -1 });

export interface IConversation extends Document {
    type: 'dm' | 'circle' | 'group';
    participants: string[];
    circleId?: string;
    name?: string;
    lastMessage?: {
        sender: string;
        content: string;
        timestamp: Date;
    };
    unreadCount: Map<string, number>;
    createdAt: Date;
    updatedAt: Date;
}

export default (models.Conversation as mongoose.Model<IConversation>) ||
    model<IConversation>('Conversation', ConversationSchema);

