import { Schema, model } from 'mongoose';
import { IProfessional, IProfileDetails } from './professional.interface';

const profileDetailsSchema = new Schema<IProfileDetails>(
  {
    experienceLevel: { type: String },
    cleaningTypes: { type: [String], default: [] },
    additionalTasks: { type: [String], default: [] },
    isPetFriendly: { type: Boolean },
    hasIndustryExperience: { type: Boolean },
    employmentStatus: { type: String },
    currentSituation: { type: String },
  },
  {
    _id: false, // Prevents creating a separate id for this sub-document
  },
);

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
      comments: [{ type: Schema.Types.ObjectId, ref: 'Comment', default: null }],
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

    profileDetails: {
      type: profileDetailsSchema,
      default: {},
    },
    gallery: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const Professional = model<IProfessional>(
  'Professional',
  professionalSchema,
);
