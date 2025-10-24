import mongoose, { Schema, models, model, Document } from 'mongoose';

const VoteSchema = new Schema({
    postId: { type: String, index: true, required: true },
    voteHash: { type: String, unique: true, required: true }, // keccak(wallet|postId|SERVER_SALT)
    createdAt: { type: Date, default: () => new Date() },
});

// Index for checking vote existence
VoteSchema.index({ postId: 1, voteHash: 1 });

export interface IVote extends Document {
    postId: string;
    voteHash: string;
    createdAt: Date;
}

export default (models.Vote as mongoose.Model<IVote>) ||
    model<IVote>('Vote', VoteSchema);

