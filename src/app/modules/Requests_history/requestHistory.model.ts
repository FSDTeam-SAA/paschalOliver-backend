import { Schema, model } from 'mongoose';
import { IRequestHistory } from './requestHistory.interface';
import { requestHistoryStatus } from './requestHistory.constant';

const requestHistorySchema = new Schema<IRequestHistory>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    professional: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: 'Address',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(requestHistoryStatus),
      default: requestHistoryStatus.new,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
requestHistorySchema.index({ professional: 1, status: 1 });
requestHistorySchema.index({ booking: 1 });

export const RequestHistory = model<IRequestHistory>(
  'RequestHistory',
  requestHistorySchema,
);
