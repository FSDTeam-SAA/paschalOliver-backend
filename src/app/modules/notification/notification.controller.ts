import { Request, Response } from 'express';
import { NotificationService } from './notification.service';

const getMyNotifications = async (req: Request, res: Response) => {
  const userId = req.user.id;

  const result = await NotificationService.getMyNotifications(userId);

  res.status(200).json({
    success: true,
    data: result,
  });
};

const markAsRead = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { notificationId } = req.params;

  const result = await NotificationService.markAsRead(
    notificationId as string,
    userId,
  );

  res.status(200).json({
    success: true,
    data: result,
  });
};

const markAllAsRead = async (req: Request, res: Response) => {
  const userId = req.user.id;

  await NotificationService.markAllAsRead(userId);

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
};

const deleteNotification = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { notificationId } = req.params;

  await NotificationService.deleteNotification(
    notificationId as string,
    userId,
  );

  res.status(200).json({
    success: true,
    message: 'Notification deleted',
  });
};

export const NotificationController = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
