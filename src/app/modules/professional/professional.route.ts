import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { fileUploader } from '../../helper/fileUploder';
import { userRole } from '../user/user.constant';
import { ProfessionalControllers } from './professional.controller';
import { ProfessionalValidations } from './professional.validation';

const router = express.Router();

router.get(
  '/',
  auth(userRole.professional),
  ProfessionalControllers.getProfile,
);
router.get(
  '/search/:subcategoryId',
  auth(userRole.client),
  ProfessionalControllers.searchBySubcategory,
);
router.get(
  '/:id',
  auth(userRole.client),
  ProfessionalControllers.getSingleProfessional,
);
router.patch(
  '/',
  auth(userRole.professional),
  fileUploader.upload.fields([
    { name: 'documentFrontImage', maxCount: 1 },
    { name: 'documentBackImage', maxCount: 1 },
  ]),
  validateRequest(ProfessionalValidations.updateProfessionalValidationSchema),
  ProfessionalControllers.updateProfile,
);

export const ProfessionalRoutes = router;
