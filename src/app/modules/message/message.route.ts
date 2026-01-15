import express from 'express';

import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';
import { getMessagesController, sendMessageController } from './message.controller';

const router = express.Router();

router.post(
  '/send-message',
  auth(userRole.professional, userRole.client),
  sendMessageController,
);

router.get(
  '/get-messages/:conversationId',
  auth(userRole.professional, userRole.client),
  getMessagesController,
);

export const MessageRoutes = router;
