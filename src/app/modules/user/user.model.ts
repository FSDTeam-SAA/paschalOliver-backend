import { Schema, model, HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../../config';
import { IUser, UserRole } from './user.interface';
import { userRole } from './user.constant';

function generateReferralCode(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const DEFAULT_ROLE: UserRole = 'client';

type UserDoc = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ✅ IMPORTANT: required function should use "this: IUser" (simpler + fixes TS)
    password: {
      type: String,
      select: false,
      required: function (this: IUser) {
        return this.authProvider === 'email';
      },
    },

    authProvider: {
      type: String,
      enum: ['email', 'google', 'apple', 'facebook'],
      default: 'email',
      required: true,
      index: true,
    },

    providerUserId: {
      type: String,
      default: null,
      index: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: Object.keys(userRole),
      required: true,
      default: DEFAULT_ROLE,
    },

    phone: { type: String },
    address: { type: String },
    image: { type: String },
    language: { type: String },
    couponCodes: { type: String },
    about: { type: String },

    isActive: { type: Boolean, default: true },

    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },

    stripeCustomerId: { type: String, select: false },

    isBlocked: { type: Boolean, default: false },

    referralCode: {
      type: String,
      unique: true,
      index: true,
      default: () => generateReferralCode(10),
    },

    referredBy: { type: String, default: null },

    walletBalance: { type: Number, default: 0 },

    myCoupons: [{ type: Schema.Types.ObjectId, ref: 'Coupon' }],
  },
  { timestamps: true },
);

userSchema.index(
  { authProvider: 1, providerUserId: 1 },
  { unique: true, sparse: true },
);

// ✅ "this" typed as UserDoc in middleware is fine
userSchema.pre('save', function (this: UserDoc, next) {
  if (this.email) this.email = this.email.toLowerCase().trim();
  next();
});

userSchema.pre('save', async function (this: UserDoc, next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcryptSaltRounds),
    );
  }
  next();
});

export const User = model<IUser>('User', userSchema);
