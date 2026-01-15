import { Types } from 'mongoose';

export interface IMessage {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  content: string;
  attachments?: string[];
  isDeleted: boolean;
  isRead: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
