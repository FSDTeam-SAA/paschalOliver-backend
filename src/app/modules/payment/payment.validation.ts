import { z } from 'zod';

const createPaymentIntentValidation = z.object({
  body: z.object({
    amount: z.number().min(1),
    professionalId: z.string(),
    bookingId: z.string(),
    couponCode: z.string().optional(),
  }),
});

const createOnboardingLinkValidation = z.object({
  body: z.object({
    professionalId: z.string(),
  }),
});

export const PaymentValidation = {
  createPaymentIntentValidation,
  createOnboardingLinkValidation,
};
