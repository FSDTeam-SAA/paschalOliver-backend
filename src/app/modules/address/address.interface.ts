import { Types } from 'mongoose';

export interface IAddress {
  user: Types.ObjectId;
  address: string;
  area: string;
  streetNumber?: string;
  addressDetails?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isDefault: boolean;
}
