import { Types } from 'mongoose';

export interface IMessage {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  content: string;
  image?: {
    url: string;
    public_id: string;
  };
  attachments?: string[];
  isDeleted: boolean;
  isRead: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
