import { z } from 'zod';

const createProfessionalValidationSchema = z.object({
  body: z.object({
    personalDetails: z
      .object({
        name: z.string().min(1),
        surname: z.string().min(1),
        gender: z.string().min(1),
        dateOfBirth: z.string().min(1),
        countryOfBirth: z.string().min(1),
        cityOfBirth: z.string().min(1),
      })
      .optional(),

    identity: z
      .object({
        documentType: z.enum(['Government ID', 'Passport']),
        documentNumber: z.string().min(1),
        documentCountry: z.string().min(1),
      })
      .optional(),

    address: z
      .object({
        street: z.string().min(1),
        streetNumber: z.string().min(1),
        zipCode: z.string().min(1),
        city: z.string().min(1),
        country: z.string().min(1),
        region: z.string().min(1),
      })
      .optional(),

    profileDetails: z
      .object({
        experienceLevel: z.string().optional(),
        cleaningTypes: z.array(z.string()).optional(),
        additionalTasks: z.array(z.string()).optional(),
        isPetFriendly: z.boolean().optional(),
        hasIndustryExperience: z.boolean().optional(),
        employmentStatus: z.string().optional(),
        currentSituation: z.string().optional(),
      })
      .optional(),

    country: z.string().optional(),
    city: z.string().optional(),
    workingAreas: z.array(z.string()).optional(),

    workSchedule: z
      .array(
        z.object({
          day: z.string(),
          isAvailable: z.coerce.boolean(),
          slots: z
            .array(z.object({ startTime: z.string(), endTime: z.string() }))
            .optional(),
        }),
      )
      .optional(),

    gallery: z.array(z.string()).optional(),
  }),
});

const updateProfessionalValidationSchema = z.object({
  body: z.object({
    personalDetails: z
      .object({
        name: z.string().min(1),
        surname: z.string().min(1),
        gender: z.string().min(1),
        dateOfBirth: z.string().min(1),
        countryOfBirth: z.string().min(1),
        cityOfBirth: z.string().min(1),
      })
      .optional(),

    identity: z
      .object({
        documentType: z.enum(['Government ID', 'Passport']),
        documentNumber: z.string().min(1),
        documentCountry: z.string().min(1),
      })
      .optional(),

    address: z
      .object({
        street: z.string().min(1),
        streetNumber: z.string().min(1),
        zipCode: z.string().min(1),
        city: z.string().min(1),
        country: z.string().min(1),
        region: z.string().min(1),
      })
      .optional(),

    profileDetails: z
      .object({
        experienceLevel: z.string().optional(),
        cleaningTypes: z.array(z.string()).optional(),
        additionalTasks: z.array(z.string()).optional(),
        isPetFriendly: z.boolean().optional(),
        hasIndustryExperience: z.boolean().optional(),
        employmentStatus: z.string().optional(),
        currentSituation: z.string().optional(),
      })
      .optional(),

    country: z.string().optional(),
    city: z.string().optional(),
    workingAreas: z.array(z.string()).optional(),

    workSchedule: z
      .array(
        z.object({
          day: z.string(),
          isAvailable: z.coerce.boolean(),
          slots: z
            .array(z.object({ startTime: z.string(), endTime: z.string() }))
            .optional(),
        }),
      )
      .optional(),

    gallery: z.array(z.string()).optional(),
  }),
});

export const ProfessionalValidations = {
  createProfessionalValidationSchema,
  updateProfessionalValidationSchema,
};
