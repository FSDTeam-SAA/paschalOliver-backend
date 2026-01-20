import mongoose, { Schema, Document, Model } from 'mongoose';
import { IComment, IReviewRatings } from './comment.interface';

export interface ICommentDocument extends IComment, Document {}

// --- Review Subschema ---
const reviewSchema = new Schema<IReviewRatings>(
  {
    service: { type: Number, min: 1, max: 5, required: true },
    communication: { type: Number, min: 1, max: 5, required: true },
    kindness: { type: Number, min: 1, max: 5, required: true },
    comfort: { type: Number, min: 1, max: 5, required: true },
  },
  { _id: false }, // no separate _id for review
);

// --- Comment Schema ---
const commentSchema = new Schema<ICommentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    professionalId: {
      type: Schema.Types.ObjectId,
      ref: 'Professional',
      required: true,
    },

    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    review: {
      type: reviewSchema,
      required: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    bookedTime: {
      type: Date,
      required: true,
    },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// --- Auto-calculate rating ---
commentSchema.pre<ICommentDocument>('save', function (next) {
  if (this.review) {
    const { service, communication, kindness, comfort } = this.review;
    this.rating = (service + communication + kindness + comfort) / 4;
  }
  next();
});


// --- Export Model ---
export const Comment: Model<ICommentDocument> =
  mongoose.model<ICommentDocument>('Comment', commentSchema);
