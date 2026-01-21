import { Types } from 'mongoose';

export type TScheduleType = 'weekly' | 'biweekly' | 'just_once';
export type TBookingStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled_by_client'
  | 'cancelled_by_professional';

export interface IBooking {
  customer: Types.ObjectId;
  service: Types.ObjectId;
  professional?: Types.ObjectId;
  address: Types.ObjectId;
  scheduleType: TScheduleType;
  date: Date;
  amount: number;
  startTime: string;
  durationInMinutes: number;
  status: TBookingStatus;
}
