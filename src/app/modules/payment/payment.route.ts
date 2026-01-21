import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { userRole } from '../user/user.constant';
import { PaymentController } from './payment.controller';
import { PaymentValidation } from './payment.validation';

const router = express.Router();

router.post(
  '/create-payment-intent',
  auth(userRole.client),
  validateRequest(PaymentValidation.createPaymentIntentValidation),
  PaymentController.createPaymentIntent,
);

router.post(
  '/create-onboarding-link',
  auth(userRole.professional),
  validateRequest(PaymentValidation.createOnboardingLinkValidation),
  PaymentController.createOnboardingLink,
);

export const PaymentRoutes = router;
