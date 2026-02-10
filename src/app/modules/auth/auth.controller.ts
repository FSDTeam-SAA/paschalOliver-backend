import config from '../../config';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { authService } from './auth.service';

/**
 * EMAIL REGISTER
 */
const registerUser = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;

  const result = await authService.registerUser({
    name,
    email,
    password,
    role,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'User registered successfully. Please verify your email.',
    data: result,
  });
});

/**
 * EMAIL LOGIN
 */
const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.loginUser({ email, password });

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully',
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    },
  });
});

/**
 * SOCIAL LOGIN (Google / Apple / Facebook)
 */
const socialLogin = catchAsync(async (req, res) => {
  const { provider, token } = req.body;

  const result = await authService.socialLogin({ provider, token });

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `${provider} login successful`,
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    },
  });
});

/**
 * SWITCH ROLE
 */
const switchRole = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const result = await authService.switchRole(userId);

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Role switched successfully',
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    },
  });
});

/**
 * REFRESH TOKEN
 */
const refreshToken = catchAsync(async (req, res) => {
  const tokenFromBody = req.body?.refreshToken;
  const tokenFromCookie = req.cookies?.refreshToken;

  const token = tokenFromBody || tokenFromCookie;
  const result = await authService.refreshToken(token);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Access token refreshed successfully',
    data: result,
  });
});

/**
 * FORGOT PASSWORD
 */
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const result = await authService.forgotPassword(email);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'OTP sent to your email',
    data: result,
  });
});

/**
 * VERIFY EMAIL
 */
const verifyEmail = catchAsync(async (req, res) => {
  const { email, otp } = req.body;

  const result = await authService.verifyEmail(email, otp);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Email verified successfully',
    data: result,
  });
});

/**
 * RESET PASSWORD
 */
const resetPassword = catchAsync(async (req, res) => {
  const { email, newPassword } = req.body;

  const result = await authService.resetPassword(email, newPassword);

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password reset successfully',
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
});

/**
 * LOGOUT
 */
const logoutUser = catchAsync(async (req, res) => {
  res.clearCookie('refreshToken');

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged out successfully',
  });
});

/**
 * CHANGE PASSWORD
 */
const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const result = await authService.changePassword(
    req.user?.id,
    oldPassword,
    newPassword,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password changed successfully',
    data: result,
  });
});

export const authController = {
  registerUser,
  verifyEmail,
  loginUser,
  socialLogin,
  switchRole,
  refreshToken,
  forgotPassword,
  resetPassword,
  logoutUser,
  changePassword,
};
