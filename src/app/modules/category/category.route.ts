import express from 'express';
import { CategoryControllers } from './category.controller';

const router = express.Router();

// Route: /api/v1/categories
router.post('/create-category', CategoryControllers.createCategory);
router.get('/', CategoryControllers.getAllCategories);
router.delete('/:id', CategoryControllers.deleteCategory);

export const CategoryRoutes = router;
