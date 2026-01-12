import { Types } from 'mongoose';

export interface IPersonalDetails {
  name: string;
  surname: string;
  gender: string;
  dateOfBirth: string;
  countryOfBirth: string;
  cityOfBirth: string;
}

export interface IIdentity {
  documentType: 'Government ID' | 'Passport';
  documentNumber: string;
  documentCountry: string;
  documentImage: string;
}

export interface IAddress {
  street: string;
  streetNumber: string;
  zipCode: string;
  city: string;
  country: string;
  region: string;
}

export interface IProfessional {
  user: Types.ObjectId;

  // -- New Profile Information --
  personalDetails: IPersonalDetails;
  identity: IIdentity;
  address: IAddress;

  country: string;
  city: string;
  workingAreas: string[];

  isVerified: boolean;
  totalJobs: number;
  averageRating: number;
}
