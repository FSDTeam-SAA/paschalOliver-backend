import express from 'express';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';
import { BookingControllers } from './booking.controller';

const router = express.Router();

router.post('/', auth(userRole.client), BookingControllers.createBooking);
router.get('/', auth(userRole.client), BookingControllers.getAllBookings);

router.patch(
  '/:id/cancel',
  auth(userRole.client),
  BookingControllers.cancelBooking,
);

export const BookingRoutes = router;
