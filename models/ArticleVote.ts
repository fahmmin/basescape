import mongoose, { Schema, models, model, Document } from 'mongoose';

const ArticleVoteSchema = new Schema({
    articleId: { type: String, index: true, required: true },
    voteHash: { type: String, unique: true, required: true }, // keccak(wallet|articleId|SERVER_SALT)
    createdAt: { type: Date, default: () => new Date() },
});

// Index for checking vote existence
ArticleVoteSchema.index({ articleId: 1, voteHash: 1 });

export interface IArticleVote extends Document {
    articleId: string;
    voteHash: string;
    createdAt: Date;
}

export default (models.ArticleVote as mongoose.Model<IArticleVote>) ||
    model<IArticleVote>('ArticleVote', ArticleVoteSchema);

