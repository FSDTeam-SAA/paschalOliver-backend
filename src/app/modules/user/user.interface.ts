import { Types } from 'mongoose';
import { userRole } from './user.constant';

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: keyof typeof userRole; // 'admin' | 'client' | 'professional'
  authProvider: 'email' | 'google' | 'apple' | 'facebook';
  providerUserId?: string;
  emailVerified?: boolean;
  phone?: string;
  address?: string;
  image?: string;
  language?: string;
  couponCodes?: string;
  about?: string;
  isActive: boolean;
  otp?: string;
  otpExpires?: Date;
  stripeCustomerId?: string;
  isBlocked: boolean;
  referralCode: string;
  referredBy?: string;
  walletBalance: number;
  myCoupons: Types.ObjectId[];
}
