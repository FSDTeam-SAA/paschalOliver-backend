import { Request, Response } from 'express';
import { NotificationService } from './notification.service';
import sendResponse from '../../utils/sendResponse';

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

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Notification marked as read successfully',
    data: result,
  });
};

const markAllAsRead = async (req: Request, res: Response) => {
  const userId = req.user.id;

  await NotificationService.markAllAsRead(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All notifications marked as read successfully',
    data: null,
  });
};

const getUnreadCount = async (req: Request, res: Response) => {
  const result = await NotificationService.getUnreadCount;
  if (!result) {
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'No notifications found',
      data: result,
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Unread count retrieved successfully',
    data: result,
  });
};

const deleteNotification = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { notificationId } = req.params;

  await NotificationService.deleteNotification(
    notificationId as string,
    userId,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Notification deleted successfully',
    data: null,
  });
};

const deleteAllNotifications = async (req: Request, res: Response) => {
  const userId = req.user.id;

  await NotificationService.deleteAllNotifications(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All notifications deleted successfully',
    data: null,
  });
};

export const NotificationController = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  deleteAllNotifications,
};
