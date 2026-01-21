import { Router } from 'express';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';
import {
  dashboardData,
  getAllProfessional,
  getAllUsers,
} from './admin.controller';

const router = Router();

router.get('/dashboard-stats', auth(userRole.admin), dashboardData);
router.get('/all-users', auth(userRole.admin), getAllUsers);
router.get('/all-professionals', auth(userRole.admin), getAllProfessional);

export const AdminRoutes = router;
