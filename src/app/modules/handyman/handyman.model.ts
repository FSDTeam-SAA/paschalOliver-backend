import { Schema, model } from 'mongoose';
import { IHandymanRequest } from './handyman.interface';

const scheduleSchema = new Schema(
  {
    frequency: {
      type: String,
      enum: ['EVERY_WEEK', 'EVERY_2_WEEKS', 'JUST_ONCE'],
      required: true,
    },
    daysOfWeek: [{ type: Number }], // 1..7
    date: { type: Date }, // JUST_ONCE
    durationMin: { type: Number, required: true, min: 15 },
    startType: {
      type: String,
      enum: ['FLEXIBLE', 'EXACT'],
      required: true,
    },
    timeWindow: { type: String }, // "6-9" etc
    exactStartAt: { type: Date },
  },
  { _id: false },
);

const paymentSchema = new Schema(
  {
    method: { type: String, enum: ['CASH', 'CARD', 'APPLE_PAY'] },
    status: {
      type: String,
      enum: ['UNPAID', 'PAID', 'REFUNDED'],
      default: 'UNPAID',
    },
  },
  { _id: false },
);

const clientReviewSchema = new Schema(
  {
    rating: { type: Number, required: true, min: 1, max: 5 },
    tags: [{ type: String }],
    comment: { type: String },
  },
  { _id: false },
);

const handymanRequestSchema = new Schema<IHandymanRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    // ✅ Changed to Reference ID
    address: {
      type: Schema.Types.ObjectId,
      ref: 'Address',
      required: true,
    },

    professionalId: {
      type: Schema.Types.ObjectId,
      ref: 'Professional',
    },

    schedule: {
      type: scheduleSchema,
      required: true,
    },

    note: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'],
      default: 'PENDING',
    },

    payment: {
      type: paymentSchema,
    },
    clientReview: {
      type: clientReviewSchema,
    },
  },
  {
    timestamps: true,
  },
);

const Handyman = model<IHandymanRequest>('Handyman', handymanRequestSchema);
export default Handyman;
