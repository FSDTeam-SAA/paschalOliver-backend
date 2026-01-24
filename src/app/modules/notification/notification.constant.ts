/**
 * ✅ Updated Notification Types
 * All notification types used across the application
 */
export const NOTIFICATION_TYPE = {
  // Booking lifecycle
  BOOKING_CREATED: 'BOOKING_CREATED', // Customer books → Professional gets notified
  BOOKING_ACCEPTED: 'BOOKING_ACCEPTED', // Professional accepts → Customer gets notified
  BOOKING_REJECTED: 'BOOKING_REJECTED', // Professional rejects → Customer gets notified (NEW)
  BOOKING_CANCELLED: 'BOOKING_CANCELLED', // Customer cancels → Professional gets notified
  BOOKING_COMPLETED: 'BOOKING_COMPLETED',

  // Payment
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',

  // Reviews
  COMMENT_CREATED: 'COMMENT_CREATED',

  // Account management
  ACCOUNT_BLOCKED: 'ACCOUNT_BLOCKED',
  ACCOUNT_UNBLOCKED: 'ACCOUNT_UNBLOCKED',

  // Security
  PASSWORD_RESET: 'PASSWORD_RESET',

  // System
  SYSTEM: 'SYSTEM',
} as const;

// Type for TypeScript autocomplete
export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];
