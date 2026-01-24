import { Schema, model, Document } from 'mongoose';
import { INotification, IUserSnapshot } from './notification.interface';

export interface INotificationDocument extends INotification, Document {}

const userSnapshotSchema = new Schema<IUserSnapshot>(
  {
    id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: false },
  },
  { _id: false },
);

const notificationSchema = new Schema<INotificationDocument>(
  {
    reciverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    receiver: {
      type: userSnapshotSchema,
      required: true,
    },

    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    sender: {
      type: userSnapshotSchema,
    },

    type: {
      type: String,
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    referenceId: {
      type: Schema.Types.ObjectId,
    },

    referenceModel: {
      type: String,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);


export const Notification = model<INotificationDocument>(
  'Notification',
  notificationSchema,
);
