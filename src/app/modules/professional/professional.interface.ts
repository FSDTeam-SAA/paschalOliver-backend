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
  documentFrontImage: string;
  documentBackImage: string;
}

export interface IAddress {
  street: string;
  streetNumber: string;
  zipCode: string;
  city: string;
  country: string;
  region: string;
}

export interface ITimeSlot {
  startTime: string;
  endTime: string;
}

export interface IDaySchedule {
  day: string;
  isAvailable: boolean;
  slots: ITimeSlot[];
}

// information of interest
export interface IProfileDetails {
  experienceLevel?: string;
  cleaningTypes?: string[];
  additionalTasks?: string[];

  // Screen: Status & Situation
  isPetFriendly?: boolean;
  hasIndustryExperience?: boolean;
  employmentStatus?: string;
  currentSituation?: string;
}

export interface IProfessional {
  user: Types.ObjectId;

  personalDetails: IPersonalDetails;
  comments: Types.ObjectId[];
  identity: IIdentity;
  address: IAddress;
  workSchedule: IDaySchedule[];
  status: string;
  country: string;
  city: string;
  workingAreas: string[];

  isVerified: boolean;
  totalJobs: number;
  averageRating: number;

  profileDetails?: IProfileDetails;
  gallery: [];

  stripeAccountId?: string;
}
