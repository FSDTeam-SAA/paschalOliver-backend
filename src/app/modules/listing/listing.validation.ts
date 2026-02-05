import { z } from 'zod';

const createListingValidationSchema = z.object({
  body: z.object({
    service: z.string(),
    selectedOptions: z.array(z.string()).min(1),
    price: z.number().min(0),
    isDiscountOffered: z.boolean().optional(),
    discountPercentage: z.number().min(0).max(100).optional(),
  }),
});

const updateListingValidationSchema = z.object({
  body: z.object({
    selectedOptions: z.array(z.string()).min(1).optional(),
    price: z.number().min(0).optional(),
    isDiscountOffered: z.boolean().optional(),
    discountPercentage: z.number().min(0).max(100).optional(),
    isActive: z.boolean().optional(),
  }),
});

const updateAboutValidationSchema = z.object({
  body: z.object({
    about: z.string(),
  }),
});

export const ListingValidations = {
  createListingValidationSchema,
  updateListingValidationSchema,
  updateAboutValidationSchema,
};
