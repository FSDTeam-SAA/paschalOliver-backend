import express from 'express';
// import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';
import {
  createConversation,
  getUserConversations,
} from './conversation.controller';

const router = express.Router();

router.post('/create-conversation', auth(userRole.client), createConversation);
router.get(
  '/get-user-conversations',
  auth(userRole.client),
  getUserConversations,
);

export const ConversationRoutes = router;
