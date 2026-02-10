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

// ✅ REAL GOOGLE VERIFY (make sure this file exists)
import { verifyGoogleIdToken } from '../../utils/google';

type AuthResult = {
  accessToken: string;
  refreshToken: string;
  user: any;
};

type SocialProvider = 'google' | 'apple' | 'facebook';

type SocialLoginPayload = {
  provider: SocialProvider;
  token: string;
};

type SocialProfile = {
  providerUserId: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  avatarUrl?: string;
};

// ✅ Stubs (Apple/Facebook for later)
async function verifyApple(_token: string): Promise<SocialProfile> {
  throw new AppError(501, 'Apple login verify not implemented yet');
}
async function verifyFacebook(_token: string): Promise<SocialProfile> {
  throw new AppError(501, 'Facebook login verify not implemented yet');
}

async function getUniqueReferralCode() {
  let newCode = generateReferralCode();
  let isUnique = await User.findOne({ referralCode: newCode });
  while (isUnique) {
    newCode = generateReferralCode();
    isUnique = await User.findOne({ referralCode: newCode });
  }
  return newCode;
}

const registerUser = async (payload: Partial<IUser>) => {
  const exist = await User.findOne({ email: payload.email });
  if (exist) throw new AppError(400, 'User already exists');

  // ✅ Ensure email auth defaults
  (payload as any).authProvider = 'email';
  (payload as any).emailVerified = false;

  // Referral Code
  const newCode = await getUniqueReferralCode();
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

  const plainPassword = payload.password;
  const hashedPassword = user.password;

  if (!plainPassword) throw new AppError(400, 'Password is required');
  if (!hashedPassword) {
    throw new AppError(
      400,
      'This account has no password set. Please login with social provider or reset password.',
    );
  }

  const isPasswordMatched = await bcrypt.compare(plainPassword, hashedPassword);
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

// ✅ SOCIAL LOGIN (Google / Apple / Facebook)
const socialLogin = async (
  payload: SocialLoginPayload,
): Promise<AuthResult> => {
  const { provider, token } = payload;

  if (!provider) throw new AppError(400, 'Provider is required');
  if (!token) throw new AppError(400, 'Token is required');

  let profile: SocialProfile;

  // ✅ REAL Google verification
  if (provider === 'google') {
    profile = await verifyGoogleIdToken(token);
  } else if (provider === 'apple') {
    profile = await verifyApple(token);
  } else if (provider === 'facebook') {
    profile = await verifyFacebook(token);
  } else {
    throw new AppError(400, 'Invalid provider');
  }

  // ✅ Find user by (authProvider + providerUserId) OR by email
  let user = await User.findOne({
    $or: [
      { authProvider: provider, providerUserId: profile.providerUserId },
      ...(profile.email ? [{ email: profile.email }] : []),
    ],
  });

  if (!user) {
    const referralCode = await getUniqueReferralCode();

    user = await User.create({
      name: profile.name || 'User',
      email: profile.email,
      role: 'client',

      // match schema fields:
      authProvider: provider,
      providerUserId: profile.providerUserId,
      emailVerified: !!profile.emailVerified,

      image: profile.avatarUrl,
      isActive: true,

      referralCode,
      walletBalance: 0,
      isBlocked: false,
      myCoupons: [],
    } as any);
  } else {
    // ✅ Ensure fields are up to date
    const update: any = {};

    if (user.authProvider !== provider) update.authProvider = provider;
    if ((user as any).providerUserId !== profile.providerUserId) {
      update.providerUserId = profile.providerUserId;
    }

    if (profile.avatarUrl && !user.image) update.image = profile.avatarUrl;
    if (profile.emailVerified && !user.emailVerified) update.emailVerified = true;

    if (Object.keys(update).length) {
      await User.findByIdAndUpdate(user._id, update, { new: true });
      user = await User.findById(user._id);
    }
  }

  if (!user) throw new AppError(500, 'Login failed');

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

const switchRole = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'User not found');

  const newRole = user.role === 'client' ? 'professional' : 'client';

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { role: newRole },
    { new: true },
  );

  if (!updatedUser) throw new AppError(404, 'User update failed');

  const accessToken = jwtHelpers.genaretToken(
    { id: updatedUser._id, role: updatedUser.role, email: updatedUser.email },
    config.jwt.accessTokenSecret as Secret,
    config.jwt.accessTokenExpires,
  );

  const refreshToken = jwtHelpers.genaretToken(
    { id: updatedUser._id, role: updatedUser.role, email: updatedUser.email },
    config.jwt.refreshTokenSecret as Secret,
    config.jwt.refreshTokenExpires,
  );

  const { password, ...userWithoutPassword } = updatedUser.toObject();
  return { accessToken, refreshToken, user: userWithoutPassword };
};

const refreshToken = async (token: string) => {
  if (!token) throw new AppError(400, 'Refresh token is required');

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

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

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

  if (!user.otp || user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
    throw new AppError(400, 'Invalid or expired OTP');
  }

  // ✅ Fix exactOptionalPropertyTypes: use $unset (do NOT assign undefined)
  await User.findByIdAndUpdate(user._id, {
    isActive: true,
    emailVerified: true,
    $unset: { otp: 1, otpExpires: 1 },
  });

  return { message: 'Email verified successfully' };
};

const resetPassword = async (email: string, newPassword: string) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError(404, 'User not found');

  user.password = newPassword;
  user.authProvider = 'email';
  user.emailVerified = true;
  await user.save();

  // ✅ remove otp fields safely
  await User.findByIdAndUpdate(user._id, {
    $unset: { otp: 1, otpExpires: 1 },
  });

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

const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError(404, 'User not found');

  const hashedPassword = user.password;
  if (!hashedPassword) {
    throw new AppError(
      400,
      'Password not set for this account. Try social login or reset password.',
    );
  }

  const isPasswordMatched = await bcrypt.compare(oldPassword, hashedPassword);
  if (!isPasswordMatched) throw new AppError(400, 'Password not matched');

  user.password = newPassword;
  await user.save();

  return { message: 'Password changed successfully' };
};

export const authService = {
  registerUser,
  loginUser,
  socialLogin,
  switchRole,
  refreshToken,
  forgotPassword,
  verifyEmail,
  resetPassword,
  changePassword,
};
