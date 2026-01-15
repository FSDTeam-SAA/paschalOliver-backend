import { Types } from 'mongoose';

export interface IConversation {
  participants: Types.ObjectId[]; // Users in conversation
  lastMessage?: Types.ObjectId;

  blockedUsers?: {
    blocker: Types.ObjectId; // who blocked
    blocked: Types.ObjectId; // who got blocked
    blockedAt: Date;
  }[];

  mutedBy?: Types.ObjectId[];
  isArchived?: boolean;
  isDeleted?: boolean;

  createdAt: Date;
  updatedAt: Date;
}
