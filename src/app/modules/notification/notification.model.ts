import { Schema, model, Document } from 'mongoose';
import { INotification, IUserSnapshot } from './notification.interface';
import { User } from '../user/user.model';

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
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

//pre middleware check reciver id exist or not in database
notificationSchema.pre('save', async function (next) {
  const reciverId = this.reciverId;
  const reciver = await User.findById({ _id: reciverId });
  if (!reciver) {
    throw new Error('reciver not found in database');
  }
  next();
});

//pre middleware check sender id exist or not in database
notificationSchema.pre('save', async function (next) {
  const senderId = this.senderId;
  const sender = await User.findById({ _id: senderId });
  if (!sender) {
    throw new Error('sender not found in database');
  }
  next();
});

export const Notification = model<INotificationDocument>(
  'Notification',
  notificationSchema,
);
