import { Router } from 'express';
import { serviceController } from './service.controller';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';

const router = Router();

router.get('/', auth(userRole.client), serviceController.getMyServices);
router.get(
  '/:id',
  auth(userRole.client),
  serviceController.getSingleServiceDetails,
);
router.patch(
  '/:id/cancel',
  auth(userRole.client),
  serviceController.cancelService,
);

export const serviceRoutes = router;
