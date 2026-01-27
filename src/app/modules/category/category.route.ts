import express from 'express';
import { CategoryControllers } from './category.controller';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';

const router = express.Router();

// Route: /api/v1/categories
router.post(
  '/create-category',
  auth(userRole.admin),
  CategoryControllers.createCategory,
);
router.get('/', CategoryControllers.getAllCategories);
router.delete('/:id', auth(userRole.admin), CategoryControllers.deleteCategory);

export const CategoryRoutes = router;
