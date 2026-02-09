import { Types } from 'mongoose';

export interface IListing {
  professional: Types.ObjectId;
  subcategory: Types.ObjectId;
  price: number;
}
