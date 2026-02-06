import { Types } from 'mongoose';

export interface IListing {
  professional: Types.ObjectId;
  subcategories: Types.ObjectId[];
  price: number;
}
