import express from 'express';
import { SubcategoryControllers } from './subcategory.controller';

const router = express.Router();

// Route: /api/v1/subcategories
router.post('/create-subcategory', SubcategoryControllers.createSubcategory);
router.get('/', SubcategoryControllers.getAllSubcategories);
router.get(
  '/category/:categoryId',
  SubcategoryControllers.getSubcategoriesByCategoryId,
);
router.delete('/:id', SubcategoryControllers.deleteSubcategory);

export const SubcategoryRoutes = router;
