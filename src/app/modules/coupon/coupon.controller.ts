import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CouponServices } from './coupon.service';

const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponServices.createCoupon(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Coupon created successfully',
    data: result,
  });
});

const applyCouponToUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { code } = req.body;
  const result = await CouponServices.applyCouponToUser(userId, code);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Coupon added to your wallet successfully',
    data: result,
  });
});

const getMyCoupons = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await CouponServices.getMyCoupons(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My coupons retrieved successfully',
    data: result,
  });
});

export const CouponControllers = {
  createCoupon,
  applyCouponToUser,
  getMyCoupons,
};
