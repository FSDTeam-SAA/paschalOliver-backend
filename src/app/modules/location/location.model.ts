import { Schema, model } from 'mongoose';
import { ILocation } from './location.interface';

const locationSchema = new Schema<ILocation>(
  {
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    areas: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Location = model<ILocation>('Location', locationSchema);
