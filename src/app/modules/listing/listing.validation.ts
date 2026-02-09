import { z } from 'zod';

const createListingValidationSchema = z.object({
  body: z.object({
    subcategory: z.string(),
    price: z.number().min(0),

    about: z.string().optional(),
    gallery: z.array(z.string()).optional(),

    profileDetails: z
      .object({
        experienceLevel: z.string().optional(),
        hasIndustryExperience: z.boolean().optional(),
        employmentStatus: z.string().optional(),
        currentSituation: z.string().optional(),
      })
      .optional(),
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
