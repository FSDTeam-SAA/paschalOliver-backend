import { Schema, model } from 'mongoose';
import { IAddress } from './address.interface';

const addressSchema = new Schema<IAddress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    streetNumber: {
      type: String,
    },
    addressDetails: {
      type: String,
    },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Address = model<IAddress>('Address', addressSchema);
