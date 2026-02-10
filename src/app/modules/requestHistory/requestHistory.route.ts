import { Router } from 'express';
import { requestHistoryController } from './requestHistory.controller';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';

const router = Router();

router.get(
  '/',
  auth(userRole.professional),
  requestHistoryController.getMyRequestHistory,
);

export const requestHistoryRoutes = router;
