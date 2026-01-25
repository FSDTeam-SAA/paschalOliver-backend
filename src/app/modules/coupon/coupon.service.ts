import { User } from '../user/user.model';
import { Coupon } from './coupon.model';
import { ICoupon } from './coupon.interface';
import AppError from '../../error/appError';

const createCoupon = async (payload: ICoupon) => {
  const result = await Coupon.create(payload);
  return result;
};

const applyCouponToUser = async (userId: string, code: string) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon || !coupon.isActive) {
    throw new AppError(404, 'Invalid or inactive coupon');
  }

  const currentDate = new Date();
  if (new Date(coupon.expiryDate) < currentDate) {
    throw new AppError(400, 'Coupon has expired');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const isAlreadyAdded = user.myCoupons.some(
    (savedCouponId) => savedCouponId.toString() === coupon._id.toString(),
  );

  if (isAlreadyAdded) {
    throw new AppError(409, 'You have already added this coupon');
  }

  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { myCoupons: coupon._id } },
    { new: true },
  );

  return {
    message: 'Coupon added successfully',
    couponCode: coupon.code,
    discount: coupon.discountValue,
  };
};

const getMyCoupons = async (userId: string) => {
  const user = await User.findById(userId).populate('myCoupons');

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user.myCoupons;
};

export const CouponServices = {
  createCoupon,
  applyCouponToUser,
  getMyCoupons,
};
