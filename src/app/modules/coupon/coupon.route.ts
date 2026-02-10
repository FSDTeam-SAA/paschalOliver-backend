import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CouponControllers } from './coupon.controller';
import { CouponValidations } from './coupon.validation';
import { userRole } from '../user/user.constant';

const router = express.Router();

router.post(
  '/create-coupon',
  auth(userRole.admin),
  validateRequest(CouponValidations.createCouponValidationSchema),
  CouponControllers.createCoupon,
);

router.post(
  '/apply-coupon',
  auth(userRole.client),
  validateRequest(CouponValidations.applyCouponValidationSchema),
  CouponControllers.applyCouponToUser,
);

router.get(
  '/my-coupons',
  auth(userRole.client),
  CouponControllers.getMyCoupons,
);

export const CouponRoutes = router;
