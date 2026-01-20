import { z } from 'zod';


const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createCommentValidationSchema = z.object({
  body: z.object({
    bookingId: z.string().regex(objectIdRegex, 'Invalid bookingId'),
    comment: z
      .string()
      .min(1, 'Comment is required')
      .max(1000, 'Comment is too long (1000 characters maximum)'),

    review: z.object({
      service: z
        .number()
        .min(1, 'Service rating must be at least 1')
        .max(5, 'Service rating must be at most 5'),

      communication: z.number().min(1).max(5),

      kindness: z.number().min(1).max(5),

      comfort: z.number().min(1).max(5),
    }),
  }),
});

