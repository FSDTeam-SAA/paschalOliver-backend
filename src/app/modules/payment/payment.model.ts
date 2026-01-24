import { Schema, model } from 'mongoose';
import { IPayment } from './payment.interface';

const paymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    professional: {
      type: Schema.Types.ObjectId,
      ref: 'Professional',
      required: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    amount: { type: Number, required: true },
    adminFee: { type: Number, required: true },
    professionalAmount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },

    transactionId: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    receiptUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const Payment = model<IPayment>('Payment', paymentSchema);
