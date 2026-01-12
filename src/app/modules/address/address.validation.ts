import { z } from 'zod';

const createAddressSchema = z.object({
  body: z.object({
    address: z.string().min(1, 'Address is required'),
    streetNumber: z.string().optional(),
    addressDetails: z.string().optional(),
    coordinates: z
      .object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
      .optional(),
    isDefault: z.boolean().optional(),
  }),
});

const updateAddressSchema = z.object({
  body: z.object({
    address: z.string().optional(),
    streetNumber: z.string().optional(),
    addressDetails: z.string().optional(),
    coordinates: z
      .object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
      .optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const AddressValidation = {
  createAddressSchema,
  updateAddressSchema,
};
