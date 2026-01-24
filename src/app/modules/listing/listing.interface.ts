import { Types } from 'mongoose';

export interface IListing {
  professional: Types.ObjectId;

  // category: Types.ObjectId;
  subcategory: Types.ObjectId;
  service: Types.ObjectId;

  selectedOptions: string[];
  price: number;
  isDiscountOffered: boolean;
  discountPercentage: number;
  isActive: boolean;
}
