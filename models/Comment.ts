import mongoose, { Schema, models, model, Document } from 'mongoose';

const CommentSchema = new Schema({
    postId: { type: String, index: true, required: true },
    text: { type: String, required: true },
    pseudo: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
});

// Index for fetching comments by post
CommentSchema.index({ postId: 1, createdAt: -1 });

export interface IComment extends Document {
    postId: string;
    text: string;
    pseudo: string;
    createdAt: Date;
}

export default (models.Comment as mongoose.Model<IComment>) ||
    model<IComment>('Comment', CommentSchema);

