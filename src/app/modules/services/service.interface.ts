import { Types } from 'mongoose';

export interface IService {
  title: string;
  image: {
    url: string;
    public_id: string;
  };
  subCategoryId: Types.ObjectId;
  serviceType: string[];
  isActive: boolean;
}
