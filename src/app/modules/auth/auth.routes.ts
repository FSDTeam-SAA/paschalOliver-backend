import express from 'express';
import { authController } from './auth.controller';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';

const router = express.Router();

/**
 * ======================
 * PUBLIC ROUTES
 * ======================
 */

// Email register
router.post('/register', authController.registerUser);

// Email login
router.post('/login', authController.loginUser);

// ✅ NEW: Social Login (Google / Apple / Facebook)
// body: { provider: 'google' | 'apple' | 'facebook', token: string }
router.post('/social-login', authController.socialLogin);

// Refresh access token
router.post('/refresh-token', authController.refreshToken);

// Forgot password (send OTP)
router.post('/forgot-password', authController.forgotPassword);

// Verify email / OTP
router.post('/verify-email', authController.verifyEmail);

// Reset password
router.post('/reset-password', authController.resetPassword);

// Logout (clears cookie)
router.post('/logout', authController.logoutUser);

/**
 * ======================
 * PROTECTED ROUTES
 * ======================
 */

// Switch role (client <-> professional)
router.post(
  '/switch-role',
  auth(userRole.client, userRole.professional),
  authController.switchRole,
);

// Change password (email users only)
router.post(
  '/change-password',
  auth(userRole.admin, userRole.client, userRole.professional),
  authController.changePassword,
);

export const authRoutes = router;
