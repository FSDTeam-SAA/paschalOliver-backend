import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CouponControllers } from './coupon.controller';
import { CouponValidations } from './coupon.validation';
import { userRole } from '../user/user.constant';

const router = express.Router();

// 1. Create Coupon (Admin Only)
router.post(
  '/create-coupon',
  auth(userRole.admin),
  validateRequest(CouponValidations.createCouponValidationSchema),
  CouponControllers.createCoupon,
);

// 2. Apply Coupon (Client Adds Code)
router.post(
  '/apply-coupon',
  auth(userRole.client), // Allow 'professional' if they also buy services
  validateRequest(CouponValidations.applyCouponValidationSchema),
  CouponControllers.applyCouponToUser,
);

// 3. Get My Coupons (Client View)
router.get(
  '/my-coupons',
  auth(userRole.client),
  CouponControllers.getMyCoupons,
);

export const CouponRoutes = router;
