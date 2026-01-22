import { Router } from 'express';
import { NotificationController } from './notification.controller';
import auth from '../../middlewares/auth';

const router = Router();

router.get('/get-my-notifications', auth(), NotificationController.getMyNotifications);

router.patch('/read/:notificationId', auth(), NotificationController.markAsRead);

router.patch('/read-all', auth(), NotificationController.markAllAsRead);

router.delete('/delete/:notificationId', auth(), NotificationController.deleteNotification);

export const NotificationRoutes = router;
