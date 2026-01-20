import express from 'express';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';
import { PaymentController } from './payment.controller';

const router = express.Router();

router.post(
  '/create-payment-intent',
  auth(userRole.client),
  PaymentController.createPaymentIntent,
);

export const PaymentRoutes = router;
