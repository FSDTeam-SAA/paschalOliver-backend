import express from 'express';
import { BookingControllers } from './booking.controller';
import { userRole } from '../../user/user.constant';
import { checkUserBlocked } from '../../../middlewares/checkBlockUser';
import auth from '../../../middlewares/auth';

const router = express.Router();

router.post(
  '/',
  auth(userRole.client),
  checkUserBlocked,
  BookingControllers.createBooking,
);
router.get('/', auth(userRole.client), BookingControllers.getAllBookings);

router.patch(
  '/:bookingId/cancel',
  auth(userRole.client),
  checkUserBlocked,
  BookingControllers.cancelBooking,
);

export const BookingRoutes = router;
