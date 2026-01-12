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
    country: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    workingAreas: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    totalJobs: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
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
