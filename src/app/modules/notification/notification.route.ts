import { Router } from 'express';
import { NotificationController } from './notification.controller';

const router = Router();

router.get('/get-my-notifications', NotificationController.getMyNotifications);

router.patch('/read/:notificationId', NotificationController.markAsRead);

router.patch('/read-all', NotificationController.markAllAsRead);

router.delete(
  '/delete/:notificationId',
  NotificationController.deleteNotification,
);

export const NotificationRoutes = router;
