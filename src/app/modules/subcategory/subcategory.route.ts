import express from 'express';
import { SubcategoryControllers } from './subcategory.controller';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';

const router = express.Router();

// Route: /api/v1/subcategories
router.post(
  '/create-subcategory',
  auth(userRole.admin),
  SubcategoryControllers.createSubcategory,
);
router.get('/', SubcategoryControllers.getAllSubcategories);
router.get(
  '/category/:categoryId',
  SubcategoryControllers.getSubcategoriesByCategoryId,
);
router.delete(
  '/:id',
  auth(userRole.admin),
  SubcategoryControllers.deleteSubcategory,
);

export const SubcategoryRoutes = router;
