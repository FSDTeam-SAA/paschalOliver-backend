import express from 'express';

import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';
import { CommentControllers } from './comment.controller';
import validateRequest from '../../middlewares/validateRequest';
import { createCommentValidationSchema } from './comment.validation';

const router = express.Router();

// Create comment
router.post(
  '/create-comment/:professionalId',
  validateRequest(createCommentValidationSchema),
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


//sensitive comment get only for admin
router.get(
  '/get-sensitive-comments/:serviceId',
  auth(userRole.admin),
  CommentControllers.getSensitiveComments,
);

export const CommentRoutes = router;
