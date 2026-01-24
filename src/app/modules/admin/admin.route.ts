import { Router } from 'express';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';
import {
  approveProfessionalController,
  dashboardData,
  getAllProfessional,
  getAllUsers,
  getProfessionalRegistrationRequestsController,
  rejectProfessionalController,
} from './admin.controller';

const router = Router();

router.get('/dashboard-stats', auth(userRole.admin), dashboardData);
router.get('/all-users', auth(userRole.admin), getAllUsers);
router.get('/all-professionals', auth(userRole.admin), getAllProfessional);
router.get(
  '/registration-request',
  auth(userRole.admin),
  getProfessionalRegistrationRequestsController,
);
router.patch(
  '/admin/professionals/approve/:professionalId',
  auth('admin'),
  approveProfessionalController,
);

router.patch(
  '/admin/professionals/reject/:professionalId',
  auth('admin'),
  rejectProfessionalController,
);

export const AdminRoutes = router;
