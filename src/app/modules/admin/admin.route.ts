import { Router } from 'express';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';
import {
  approveProfessionalController,
  blockUserController,
  bookingManagementController,
  dashboardData,
  getAllProfessional,
  getAllUsers,
  getProfessionalRegistrationRequestsController,
  rejectProfessionalController,
  unBlockUserController,
} from './admin.controller';

const router = Router();

router.get('/dashboard-stats', auth(userRole.admin), dashboardData);
router.get('/all-clients', auth(userRole.admin), getAllUsers);
router.get('/all-professionals', auth(userRole.admin), getAllProfessional);
router.get(
  '/registration-request',
  auth(userRole.admin),
  getProfessionalRegistrationRequestsController,
);

router.get(
  '/booking-management',
  auth(userRole.admin),
  bookingManagementController,
);
router.patch(
  '/professionals/approve/:professionalId',
  auth('admin'),
  approveProfessionalController,
);

router.patch(
  '/professionals/reject/:professionalId',
  auth('admin'),
  rejectProfessionalController,
);

router.patch('/users/block/:userId', auth(userRole.admin), blockUserController);
router.patch(
  '/users/unblock/:userId',
  auth(userRole.admin),
  unBlockUserController,
);

export const AdminRoutes = router;
