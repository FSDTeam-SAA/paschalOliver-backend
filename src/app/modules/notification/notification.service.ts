import { Notification } from './notification.model';
import { INotification } from './notification.interface';
import { ClientSession } from 'mongoose';
import { User } from '../user/user.model';
import AppError from '../../error/appError';

const createNotification = async (
  payload: Partial<INotification>,
  session?: ClientSession,
): Promise<INotification> => {
  if (payload.reciverId) {
    const receiver = await User.findById(payload.reciverId)
      .select('_id')
      .lean();
    if (!receiver) {
      throw new AppError(404, 'Receiver not found');
    }
  }

  if (payload.senderId) {
    const sender = await User.findById(payload.senderId).select('_id').lean();
    if (!sender) {
      throw new AppError(404, 'Sender not found');
    }
  }

  let notification;

  if (session) {
    const result = await Notification.create([payload], { session });
    notification = result[0];
  } else {
    notification = await Notification.create(payload);
  }

  return notification!.toObject() as INotification;
};

const getMyNotifications = async (userId: string): Promise<INotification[]> => {
  const result = await Notification.find({
    reciverId: userId,
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .lean<INotification[]>();

  return result;
};

const getUnreadCount = async (userId: string): Promise<number> => {
  return await Notification.countDocuments({
    reciverId: userId,
    isDeleted: false,
    isRead: false,
  });
};

const markAsRead = async (
  notificationId: string,
  userId: string,
): Promise<INotification> => {
  const result = await Notification.findOneAndUpdate(
    { _id: notificationId, reciverId: userId, isDeleted: false },
    { isRead: true },
    { new: true },
  ).lean<INotification>();

  if (!result) {
    throw new AppError(404, 'Notification not found');
  }

  return result;
};

const markAllAsRead = async (userId: string) => {
  const result = await Notification.updateMany(
    { reciverId: userId, isRead: false, isDeleted: false },
    { isRead: true },
  );

  return {
    success: true,
    modifiedCount: result.modifiedCount,
    message:
      result.modifiedCount === 0
        ? 'No unread notifications'
        : `${result.modifiedCount} notifications marked as read`,
  };
};

const deleteNotification = async (
  notificationId: string,
  userId: string,
): Promise<INotification> => {
  const result = await Notification.findOneAndUpdate(
    { _id: notificationId, reciverId: userId, isDeleted: false },
    { isDeleted: true },
    { new: true },
  ).lean<INotification>();

  if (!result) {
    throw new AppError(404, 'Notification not found');
  }

  return result;
};

const deleteAllNotifications = async (userId: string) => {
  const result = await Notification.updateMany(
    { reciverId: userId, isDeleted: false },
    { isDeleted: true },
  );

  return {
    success: true,
    deletedCount: result.modifiedCount,
    message:
      result.modifiedCount === 0
        ? 'No notifications to delete'
        : `${result.modifiedCount} notifications deleted`,
  };
};

export const NotificationService = {
  createNotification,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};
