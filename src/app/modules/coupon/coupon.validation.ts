import { z } from 'zod';

const createCouponValidationSchema = z.object({
  body: z.object({
    code: z.string(),
    discountValue: z.number().min(0),
    discountType: z.enum(['percentage', 'fixed']),
    expiryDate: z.string(), // Input as string (ISO date), converted later
  }),
});

const applyCouponValidationSchema = z.object({
  body: z.object({
    code: z.string(),
  }),
});

export const CouponValidations = {
  createCouponValidationSchema,
  applyCouponValidationSchema,
};
