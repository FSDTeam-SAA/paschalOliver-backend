import { model, Schema } from 'mongoose';
// import AppError from '../../error/appError';
import { IMessage } from './message.interface';

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      // required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
    message: { type: String, required: false },
    image: {
      url: {
        type: String,
        required: false,
      },
      public_id: { type: String, required: false },
    },
    attachments: { type: [String], required: false },
    isRead: { type: Boolean, default: false },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Handyman', required: false },
  },
  {
    timestamps: true,
  },
);
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

export const Message = model<IMessage>('Message', messageSchema);
