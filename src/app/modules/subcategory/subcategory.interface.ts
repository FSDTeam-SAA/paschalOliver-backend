import { Types } from 'mongoose';

export interface ISubcategory {
  title: string;
  image: string;
  categoryId: Types.ObjectId;
  isActive: boolean;
}
