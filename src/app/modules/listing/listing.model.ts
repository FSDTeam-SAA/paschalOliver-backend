import { model, Schema } from 'mongoose';
import { IListing } from './listing.interface';

const listingSchema = new Schema<IListing>(
  {
    professional: {
      type: Schema.Types.ObjectId,
      ref: 'Professional',
      required: true,
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate listings for the same subcategory by the same professional
listingSchema.index({ professional: 1, subcategory: 1 }, { unique: true });

export const Listing = model<IListing>('Listing', listingSchema);
