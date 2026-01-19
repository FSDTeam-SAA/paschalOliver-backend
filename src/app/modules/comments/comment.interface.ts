import { Types } from 'mongoose';

export interface IReviewRatings {
  service: number; // 1-5
  communication: number; // 1-5
  kindness: number; // 1-5
  comfort: number; // 1-5
}

export interface IComment {
  userId: Types.ObjectId; // Reference to User
  professionalId: Types.ObjectId; // Reference to Professional
  bookingId: Types.ObjectId; // Reference to Booking
  serviceId: Types.ObjectId; // Reference to Service
  comment?: string; // Optional text comment
  review: IReviewRatings; // Nested review object
  rating: number; // Auto-cal
  bookedTime: Date;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
