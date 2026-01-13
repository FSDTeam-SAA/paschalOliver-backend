import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { fileUploader } from '../../helper/fileUploder';
import parseBody from '../../middlewares/parseBody';
import { userRole } from '../user/user.constant';
import { ProfessionalControllers } from './professional.controller';
import { ProfessionalValidations } from './professional.validation';

const router = express.Router();

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

router.get(
  '/',
  auth(userRole.professional),
  ProfessionalControllers.getProfile,
);

export const ProfessionalRoutes = router;
