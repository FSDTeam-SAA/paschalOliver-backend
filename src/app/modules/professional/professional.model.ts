import { Schema, model } from 'mongoose';
import { IProfessional } from './professional.interface';

const professionalSchema = new Schema<IProfessional>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    personalDetails: {
      name: { type: String, default: '' },
      surname: { type: String, default: '' },
      gender: { type: String, default: '' },
      dateOfBirth: { type: String, default: '' },
      countryOfBirth: { type: String, default: '' },
      cityOfBirth: { type: String, default: '' },
    },

    identity: {
      documentType: {
        type: String,
        enum: ['Government ID', 'Passport'],
        default: 'Government ID',
      },
      documentNumber: { type: String, default: '' },
      documentCountry: { type: String, default: '' },
      documentFrontImage: { type: String, default: '' },
      documentBackImage: { type: String, default: '' },
    },

    address: {
      street: { type: String, default: '' },
      streetNumber: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      city: { type: String, default: '' },
      country: { type: String, default: '' },
      region: { type: String, default: '' },
    },

    workSchedule: [
      {
        day: { type: String, required: true },
        isAvailable: { type: Boolean, default: false },
        slots: [
          {
            startTime: { type: String },
            endTime: { type: String },
          },
        ],
      },
    ],

    country: { type: String, default: '' },
    city: { type: String, default: '' },
    workingAreas: { type: [String], default: [] },

    isVerified: { type: Boolean, default: false },
    totalJobs: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

export const Professional = model<IProfessional>(
  'Professional',
  professionalSchema,
);
