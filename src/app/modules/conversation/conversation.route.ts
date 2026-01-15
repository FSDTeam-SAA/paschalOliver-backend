import express from 'express';
// import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';
import {
  createConversation,
  getUserConversations,
  blockUser,
  unblockUser,deleteConversation
} from './conversation.controller';

const router = express.Router();

router.post('/create-conversation', auth(userRole.client), createConversation);
router.get(
  '/get-user-conversations',
  auth(userRole.client, userRole.professional),
  getUserConversations,
);

router.post(
  '/block-user',
  auth(userRole.client, userRole.professional),
  blockUser,
);

router.post(
  '/unblock-user',
  auth(userRole.client, userRole.professional),
  unblockUser,
);
router.delete(
  '/delete-conversation/:conversationId',
  auth(userRole.client, userRole.professional),
  deleteConversation,
);

export const ConversationRoutes = router;
