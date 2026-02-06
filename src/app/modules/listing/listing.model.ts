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
    subcategories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Subcategory',
        required: true,
      },
    ],
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
listingSchema.index({ professional: 1, subcategories: 1 }, { unique: true });

// Check for duplicates before save
listingSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('subcategories')) {
    const isExist = await Listing.findOne({
      professional: this.professional,
      _id: { $ne: this._id },
      subcategories: { $in: this.subcategories },
    });

    if (isExist) {
      throw new AppError(
        409,
        'One or more selected subcategories are already listed in your other listings.',
      );
    }
  }
  next();
});

export const Listing = model<IListing>('Listing', listingSchema);
