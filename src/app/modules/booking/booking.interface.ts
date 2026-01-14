import { Types } from 'mongoose';

export type TScheduleType = 'weekly' | 'biweekly' | 'just_once';
export type TBookingStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface IBooking {
  customer: Types.ObjectId;
  service: Types.ObjectId; // Which Subcategory
  professional?: Types.ObjectId;
  address: Types.ObjectId;
  scheduleType: TScheduleType;
  date: Date;
  startTime: string;
  durationInMinutes: number;
  status: TBookingStatus;
}
