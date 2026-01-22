import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../../config';
import { IUser } from './user.interface';
import { userRole } from './user.constant';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
    },
    role: {
      type: String,
      enum: Object.keys(userRole),
      required: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    image: {
      type: String,
    },
    language: {
      type: String,
    },
    couponCodes: {
      type: String,
    },
    about: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    otp: {
      type: String,
      select: 0,
    },
    otpExpires: {
      type: Date,
      select: 0,
    },
    stripeCustomerId: {
      type: String,
      select: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    referralCode: {
      type: String,
      unique: true,
    },
    referredBy: {
      type: String,
      default: null,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Password Hashing Middleware
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcryptSaltRounds),
    );
  }
  next();
});

export const User = model<IUser>('User', userSchema);
