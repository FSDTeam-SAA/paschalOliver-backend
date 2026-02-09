import express, { NextFunction, Request, Response } from 'express';
import { SubcategoryControllers } from './subcategory.controller';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';
import { fileUploader } from '../../helper/fileUploder';

const router = express.Router();

router.post(
  '/create-subcategory',
  //auth(userRole.admin),
  fileUploader.upload.single('image'),
  (req: Request, res: Response, next: NextFunction) => {
    next();
  },
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
