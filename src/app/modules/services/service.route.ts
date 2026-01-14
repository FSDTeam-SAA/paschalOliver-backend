import express from 'express';
import {
  createService,
  getAllServices,
  getSingleService,
  getServicesBySubcategory,
  updateService,
  deleteService,
} from './service.controller';
import { upload } from '../../middlewares/multer.middleware';
import validateRequest from '../../middlewares/validateRequest';
import {
  createServiceSchema,
  updateServiceSchema,
} from './service.validationSchema';

const router = express.Router();

// Route: /api/v1/subcategories
router.post(
  '/create-service',
  upload.single('image'),
  validateRequest(createServiceSchema),
  createService,
);
router.get('/get-single-service/:serviceId', getSingleService);
router.get('/get-services/:subcategoryId', getServicesBySubcategory);
router.get('/get-all-services', getAllServices);
router.patch(
  '/update-service/:serviceId',
  upload.single('image'),
  validateRequest(updateServiceSchema),
  updateService,
);
router.delete('/delete-service/:serviceId', deleteService);
export const ServiceRoutes = router;
