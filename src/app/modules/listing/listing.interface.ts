import { Types } from 'mongoose';

export interface IListing {
  professional: Types.ObjectId;
  service: Types.ObjectId;
  selectedOptions: string[];
  price: number;
  isActive: boolean;
}
