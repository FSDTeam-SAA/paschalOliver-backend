import { Types } from 'mongoose';
import { userRole } from './user.constant';

export type UserRole = keyof typeof userRole; // 'admin' | 'client' | 'professional'
export type AuthProvider = 'email' | 'google' | 'apple' | 'facebook';

export interface IUser {
  name: string;
  email: string;

  // ✅ optional because social users may not have password
  password?: string | undefined;

  role: UserRole; // 'admin' | 'client' | 'professional'

  phone?: string | undefined;
  address?: string | undefined;
  image?: string | undefined;
  language?: string | undefined;
  couponCodes?: string | undefined;
  about?: string | undefined;

  isActive: boolean;

  otp?: string | undefined;
  otpExpires?: Date | undefined;

  stripeCustomerId?: string | undefined;

  isBlocked: boolean;

  referralCode: string;
  referredBy?: string | undefined;

  walletBalance: number;
  myCoupons: Types.ObjectId[];

  // ✅ fields used in your schema
  authProvider: AuthProvider;
  providerUserId?: string | null | undefined;
  emailVerified: boolean;
}
