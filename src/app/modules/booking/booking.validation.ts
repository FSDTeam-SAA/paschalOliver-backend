import { z } from 'zod';

const createBookingValidationSchema = z.object({
  body: z.object({
    professional: z.string(),
    service: z.string(),
    address: z.string(),
    scheduleType: z.enum(['weekly', 'biweekly', 'just_once']),
    date: z.string(),
    startTime: z.string(),
    durationInMinutes: z.number(),
  }),
});

const updateBookingValidationSchema = z.object({
  body: z.object({
    professional: z.string().optional(),
    service: z.string().optional(),
    address: z.string().optional(),
    scheduleType: z.enum(['weekly', 'biweekly', 'just_once']).optional(),
    date: z.string().optional(),
    startTime: z.string().optional(),
    durationInMinutes: z.number().optional(),
    status: z
      .enum([
        'pending',
        'accepted',
        'in_progress',
        'completed',
        'cancelled_by_client',
        'cancelled_by_professional',
      ])
      .optional(),
    paymentStatus: z.enum(['pending', 'paid', 'failed']).optional(),
  }),
});

export const BookingValidation = {
  createBookingValidationSchema,
  updateBookingValidationSchema,
};
