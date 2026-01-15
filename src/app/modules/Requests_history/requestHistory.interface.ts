import { Types } from 'mongoose';
import { TRequestHistoryStatus } from './requestHistory.constant';

export interface IRequestHistory {
  booking: Types.ObjectId;
  customer: Types.ObjectId;
  professional?: Types.ObjectId;
  service: Types.ObjectId;
  address: Types.ObjectId;
  status: TRequestHistoryStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IrequestQuery {
  status?: TRequestHistoryStatus;
  page: number;
  limit: number;
}
