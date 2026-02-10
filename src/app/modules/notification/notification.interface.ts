import { Types } from 'mongoose';

export interface IUserSnapshot {
  id: Types.ObjectId;
  name: string;
}

export interface INotification {
  reciverId: Types.ObjectId; // receiver id

  receiver: IUserSnapshot;

  senderId?: Types.ObjectId;
  sender?: IUserSnapshot;

  type: string;

  title: string;
  message: string;

  referenceId?: Types.ObjectId;
  referenceModel?: string;

  isRead: boolean;
  isDeleted: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
