import { Types } from 'mongoose';

export interface IPayment {
  user: Types.ObjectId;
  professional: Types.ObjectId;
  booking: Types.ObjectId;

  amount: number;
  discountAmount?: number;
  adminFee: number;
  professionalAmount: number;
  currency: string;

  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  receiptUrl?: string;
}
