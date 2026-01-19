import express from 'express';

import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';
import { CommentControllers } from './comment.controller';

const router = express.Router();

// Create comment
router.post(
  '/create-comment/:professionalId',
  auth(userRole.client),
  CommentControllers.createComment,
);

// Get all comments (public / admin use)
router.get('/get-comments/:serviceId', CommentControllers.getAllComments);

// Get logged-in user's comments
router.get(
  '/my-comments',
  auth(userRole.client),
  CommentControllers.getMyComments,
);

// Soft delete comment
router.delete(
  '/delete-comment/:commentId',
  auth(userRole.client),
  CommentControllers.deleteComment,
);

export const CommentRoutes = router;
