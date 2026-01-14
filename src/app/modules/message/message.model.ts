import { model, Schema } from 'mongoose';
// import AppError from '../../error/appError';
import { IMessage } from './message.interface';

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
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
    content: { type: String, required: true },
    attachments: { type: [String], required: false },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

export const Message = model<IMessage>('Message', messageSchema);
