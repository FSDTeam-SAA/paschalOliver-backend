import { z } from 'zod';
import { Types } from 'mongoose';

// Create Service Schema (body.value style)
export const createServiceSchema = z.object({
  body: z.object({
    value: z.object({
      title: z.string().min(1, 'Service title is required'),
      subCategoryId: z
        .string()
        .min(1, 'Subcategory ID is required')
        .refine((val) => Types.ObjectId.isValid(val), {
          message: 'Invalid Subcategory ID',
        }),
      serviceType: z
        .array(z.string().min(1, 'Service type item cannot be empty'))
        .nonempty('At least one service type is required'),
      isActive: z.boolean().optional().default(true),
    }),
  }),
});

//update service
export const updateServiceSchema = z.object({
  body: z.object({
    value: z.object({
      title: z.string().min(1, 'Service title is required').optional(),
      subCategoryId: z
        .string()
        .min(1, 'Subcategory ID is required')
        .optional()
        .refine((val) => Types.ObjectId.isValid(val as string), {
          message: 'Invalid Subcategory ID',
        }),
      serviceType: z
        .array(z.string().min(1, 'Service type item cannot be empty'))
        .nonempty('At least one service type is required')
        .optional(),
      isActive: z.boolean().optional(),
    }),
  }),
});
