import { model, Schema } from 'mongoose';
import { IListing } from './listing.interface';
import AppError from '../../error/appError';

const listingSchema = new Schema<IListing>(
  {
    professional: {
      type: Schema.Types.ObjectId,
      ref: 'Professional',
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    selectedOptions: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          return v && v.length > 0;
        },
        message: 'You must select at least one option.',
      },
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    isDiscountOffered: {
      type: Boolean,
      default: false,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate listings for the same service by the same professional
listingSchema.index({ professional: 1, service: 1 }, { unique: true });

// Check for duplicates before save
listingSchema.pre('save', async function (next) {
  const isExist = await Listing.findOne({
    professional: this.professional,
    service: this.service,
  });

  if (isExist) {
    throw new AppError(
      409,
      'You have already created a listing for this service.',
    );
  }
  next();
});

export const Listing = model<IListing>('Listing', listingSchema);
