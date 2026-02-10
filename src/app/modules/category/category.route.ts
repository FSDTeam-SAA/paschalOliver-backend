import express, { NextFunction, Request, Response } from 'express';
import { CategoryControllers } from './category.controller';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';
import { fileUploader } from '../../helper/fileUploder';

const router = express.Router();

// Route: /api/v1/categories
router.post(
  '/create-category',
  auth(userRole.admin),
  fileUploader.upload.single('image'),
  (req: Request, res: Response, next: NextFunction) => {
    // Parse body if data is sent as stringified JSON
    // if (req.body.data) {
    //   req.body = JSON.parse(req.body.data);
    // }
    next();
  },
  CategoryControllers.createCategory,
);

router.get('/', CategoryControllers.getAllCategories);

router.delete('/:id', auth(userRole.admin), CategoryControllers.deleteCategory);

export const CategoryRoutes = router;
