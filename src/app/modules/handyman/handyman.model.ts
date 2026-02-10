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
  { _id: false }
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
  { _id: false }
);

// ✅ coordinates
const coordinatesSchema = new Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { _id: false }
);

// ✅ address schema (array items)
const addressSchema = new Schema(
  {
    state: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    zipcode: { type: String, required: true, trim: true },
    coordinates: { type: coordinatesSchema, required: true },
  },
  { _id: false }
);

const handymanRequestSchema = new Schema<IHandymanRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'subCategory',
      required: true,
    },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },

    // ✅ addresses embedded
    addresses: {
      type: [addressSchema],
      required: true,
      validate: {
        validator: function (v: any[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one address is required',
      },
    },

    professionalId: { type: Schema.Types.ObjectId, ref: 'Professional' },

    schedule: { type: scheduleSchema, required: true },

    note: { type: String, trim: true },

    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'],
      default: 'PENDING',
    },

    payment: { type: paymentSchema },
  },
  { timestamps: true }
);

const Handyman = model<IHandymanRequest>('Handyman', handymanRequestSchema);
export default Handyman;
