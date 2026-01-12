import { Types } from 'mongoose';

export interface IProfessional {
  user: Types.ObjectId; // Link to the User (Auth)
  country: string;
  city: string;
  workingAreas: string[];
  isVerified: boolean; // Admin verification status
  totalJobs: number;
  averageRating: number;
}
