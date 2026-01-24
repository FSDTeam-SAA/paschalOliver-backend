import express from 'express';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';
import { BookingControllers } from './booking.controller';
import { checkUserBlocked } from '../../middlewares/checkBlockUser';

const router = express.Router();

router.post(
  '/',
  auth(userRole.client),
  checkUserBlocked,
  BookingControllers.createBooking,
);
router.get('/', auth(userRole.client), BookingControllers.getAllBookings);

router.patch(
  '/:id/cancel',
  checkUserBlocked,
  auth(userRole.client),
  BookingControllers.cancelBooking,
);

export const BookingRoutes = router;
