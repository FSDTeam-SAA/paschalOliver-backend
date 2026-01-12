import express from 'express';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';
import { ProfessionalControllers } from './professional.controller';

const router = express.Router();

router.patch(
  '/',
  auth(userRole.professional),
  ProfessionalControllers.updateProfile,
);

router.get(
  '/',
  auth(userRole.professional),
  ProfessionalControllers.getProfile,
);

export const ProfessionalRoutes = router;
