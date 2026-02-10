import { Types } from 'mongoose';

export type TFrequency = 'EVERY_WEEK' | 'EVERY_2_WEEKS' | 'JUST_ONCE';
export type TStartType = 'FLEXIBLE' | 'EXACT';

export type TRequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

export interface IHandymanSchedule {
  frequency: TFrequency;
  daysOfWeek?: number[]; // 1..7
  date?: Date; // JUST_ONCE
  durationMin: number;
  startType: TStartType;
  timeWindow?: string; // "6-9" etc
  exactStartAt?: Date; // if startType=EXACT
}

export interface IHandymanPayment {
  method?: 'CASH' | 'CARD' | 'APPLE_PAY';
  status?: 'UNPAID' | 'PAID' | 'REFUNDED';
}

export interface IHandymanRequest {
  userId: Types.ObjectId;

  subCategoryId: Types.ObjectId;
  categoryId: Types.ObjectId;

  // ✅ Address Reference ID
  address: Types.ObjectId;

  professionalId?: Types.ObjectId;

  schedule: IHandymanSchedule;

  note?: string;

  status: TRequestStatus;

  payment?: IHandymanPayment;
}
