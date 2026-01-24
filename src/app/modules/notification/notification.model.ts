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
      index: true, // ✅ Added index for faster queries
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true, // ✅ Added index for faster queries
    },
  },
  { timestamps: true },
);

// ✅ COMPOUND INDEX for common query pattern
// This makes "get my unread notifications" queries MUCH faster
notificationSchema.index({ reciverId: 1, isDeleted: 1, isRead: 1 });
notificationSchema.index({ reciverId: 1, createdAt: -1 }); // For sorting by date

// ❌ REMOVED PROBLEMATIC PRE-SAVE HOOKS
// Validation should happen at business logic level, not database level
// These hooks were causing:
// - 2 extra DB queries per notification
// - Performance bottlenecks
// - Wrong syntax: findById({ _id: id }) should be findById(id)

export const Notification = model<INotificationDocument>(
  'Notification',
  notificationSchema,
);
