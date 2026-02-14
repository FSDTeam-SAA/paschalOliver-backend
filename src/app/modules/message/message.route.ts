import express from 'express';

import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';
import { getMessagesController, sendMessageController,markMessageAsReadController,deleteMessageController, hardDeleteMessageController, getCommunicatedUsersController } from './message.controller';
import { fileUploader } from '../../helper/fileUploder';

const router = express.Router();

router.get(
  '/get-communicated-users',
  auth(userRole.professional, userRole.client),
  getCommunicatedUsersController,
)
router.post(
  '/send-message',
  auth(userRole.professional, userRole.client),
  fileUploader.upload.single('image'),
  sendMessageController,
);

router.get(
  '/get-messages',
  auth(userRole.professional, userRole.client),
  getMessagesController,
);
router.post(
  '/read-messages/:messageId',
  auth(userRole.professional, userRole.client),
  markMessageAsReadController,
);
router.delete(
  '/delete-message/:messageId',
  auth(userRole.professional, userRole.client),
  deleteMessageController,
);

router.delete(
  '/hard-delete-message/:messageId',
  auth(userRole.admin),
  hardDeleteMessageController,
);

export const MessageRoutes = router;
