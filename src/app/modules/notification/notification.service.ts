import { Notification } from './notification.model';
import { INotification } from './notification.interface';
import { ClientSession } from 'mongoose';

/**
 * ✅ Create notification
 * - Normal call → works
 * - Transaction call → works
 */
const createNotification: any = async (
  payload: Partial<INotification>,
  session?: ClientSession,
) => {
  if (session) {
    // 🔥 transaction-aware write
    return Notification.create([payload], { session });
  }

  // 🟢 normal write (no transaction)
  return Notification.create(payload);
};

const getMyNotifications = async (userId: string) => {
  const result = await Notification.find({
    reciverId: userId,
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .lean();

  if (result.length === 0) {
    throw new Error('You have no notifications');
  }

  return result;
};

const markAsRead = async (notificationId: string, userId: string) => {
  const result = await Notification.findOneAndUpdate(
    { _id: notificationId, reciverId: userId },
    { isRead: true },
    { new: true },
  );

  if (!result) {
    throw new Error('Notification not found');
  }

  return result;
};

const markAllAsRead = async (userId: string) => {
  const result = await Notification.updateMany(
    { reciverId: userId, isRead: false },
    { isRead: true },
  );

  if (result.modifiedCount === 0) {
    throw new Error('No notifications to mark as read');
  }

  return result;
};

const deleteNotification = async (notificationId: string, userId: string) => {
  const result = await Notification.findOneAndUpdate(
    { _id: notificationId, reciverId: userId },
    { isDeleted: true },
  );

  if (!result) {
    throw new Error('Notification not found');
  }

  return result;
};

export const NotificationService = {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
