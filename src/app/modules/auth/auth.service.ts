import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../error/appError';
import { IUser } from '../user/user.interface';
import { jwtHelpers } from '../../helper/jwtHelpers';
import sendMailer from '../../helper/sendMailer';
import bcrypt from 'bcryptjs';
import createOtpTemplate from '../../utils/createOtpTemplate';
import { User } from '../user/user.model';
import { generateReferralCode } from '../../helper/referralHelper';

const registerUser = async (payload: Partial<IUser>) => {
  const exist = await User.findOne({ email: payload.email });
  if (exist) throw new AppError(400, 'User already exists');

  // Referral Code
  let newCode = generateReferralCode();
  let isUnique = await User.findOne({ referralCode: newCode });
  while (isUnique) {
    newCode = generateReferralCode();
    isUnique = await User.findOne({ referralCode: newCode });
  }
  payload.referralCode = newCode;

  if (payload.referredBy) {
    const referrer = await User.findOne({ referralCode: payload.referredBy });

    if (referrer) {
      await User.findByIdAndUpdate(referrer._id, {
        $inc: { walletBalance: 10 },
      });
      payload.walletBalance = 10;
    } else {
      delete payload.referredBy;
    }
  }

  const user = await User.create(payload);

  return user;
};

const loginUser = async (payload: Partial<IUser>) => {
  const user = await User.findOne({ email: payload.email }).select('+password');
  if (!user) throw new AppError(401, 'User not found');
  if (!payload.password) throw new AppError(400, 'Password is required');

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );
  if (!isPasswordMatched) throw new AppError(401, 'Password not matched');

  const accessToken = jwtHelpers.genaretToken(
    { id: user._id, role: user.role, email: user.email },
    config.jwt.accessTokenSecret as Secret,
    config.jwt.accessTokenExpires,
  );

  const refreshToken = jwtHelpers.genaretToken(
    { id: user._id, role: user.role, email: user.email },
    config.jwt.refreshTokenSecret as Secret,
    config.jwt.refreshTokenExpires,
  );

  const { password, ...userWithoutPassword } = user.toObject();
  return { accessToken, refreshToken, user: userWithoutPassword };
};

const refreshToken = async (token: string) => {
  const varifiedToken = jwtHelpers.verifyToken(
    token,
    config.jwt.refreshTokenSecret as Secret,
  ) as JwtPayload;

  const user = await User.findById(varifiedToken.id);
  if (!user) throw new AppError(401, 'User not found');

  const accessToken = jwtHelpers.genaretToken(
    { id: user._id, role: user.role, email: user.email },
    config.jwt.accessTokenSecret as Secret,
    config.jwt.accessTokenExpires,
  );

  const { password, ...userWithoutPassword } = user.toObject();
  return { accessToken, user: userWithoutPassword };
};

const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError(401, 'User not found');

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  await user.save();

  await sendMailer(
    user.email,
    'Reset Password OTP',
    createOtpTemplate(otp, user.email, 'Your Company'),
  );

  return { message: 'OTP sent to your email' };
};

const verifyEmail = async (email: string, otp: string) => {
  const user = await User.findOne({ email }).select('+otp +otpExpires');
  if (!user) throw new AppError(401, 'User not found');
  console.log('DB OTP:', user.otp, 'Input OTP:', otp);
  console.log('DB Expires:', user.otpExpires);
  console.log('Current Time:', new Date());

  if (user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
    throw new AppError(400, 'Invalid or expired OTP');
  }

  user.isActive = true;
  user.otp = undefined as any;
  user.otpExpires = undefined as any;

  await user.save();

  return { message: 'Email verified successfully' };
};

const resetPassword = async (email: string, newPassword: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError(404, 'User not found');

  user.password = newPassword;
  (user as any).otp = undefined;
  (user as any).otpExpiry = undefined;
  await user.save();

  // Auto-login after reset
  const accessToken = jwtHelpers.genaretToken(
    { id: user._id, role: user.role, email: user.email },
    config.jwt.accessTokenSecret as Secret,
    config.jwt.accessTokenExpires,
  );
  const refreshToken = jwtHelpers.genaretToken(
    { id: user._id, role: user.role, email: user.email },
    config.jwt.refreshTokenSecret as Secret,
    config.jwt.refreshTokenExpires,
  );

  const { password, ...userWithoutPassword } = user.toObject();
  return {
    accessToken,
    refreshToken,
    user: userWithoutPassword,
  };
};

const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError(404, 'User not found');
  const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordMatched) throw new AppError(400, 'Password not matched');

  user.password = newPassword;
  await user.save();

  return { message: 'Password changed successfully' };
};

export const authService = {
  registerUser,
  loginUser,
  refreshToken,
  forgotPassword,
  verifyEmail,
  resetPassword,
  changePassword,
};
