import { Router } from 'express';
import { NotificationController } from './notification.controller';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';

const router = Router();

router.get(
  '/get-my-notifications',
  auth(userRole.client, userRole.professional),
  NotificationController.getMyNotifications,
);

router.patch(
  '/read/:notificationId',
  auth(userRole.client, userRole.professional),
  NotificationController.markAsRead,
);

router.patch(
  '/read-all',
  auth(userRole.client, userRole.professional),
  NotificationController.markAllAsRead,
);

router.get(
  '/get-unread-count',
  auth(userRole.client, userRole.professional),
  NotificationController.getUnreadCount,
);

router.delete(
  '/delete/:notificationId',
  auth(),
  NotificationController.deleteNotification,
);

router.delete(
  '/delete-all',
  auth(),
  NotificationController.deleteAllNotifications,
);

export const NotificationRoutes = router;
