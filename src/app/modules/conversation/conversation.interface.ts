import { Types } from 'mongoose';

export interface IConversation {
  participants: Types.ObjectId[]; // Users in conversation
  lastMessage?: Types.ObjectId; // Last message sent
  blockedBy?: Types.ObjectId[]; // Users who blocked this conversation
  mutedBy?: Types.ObjectId[]; // Users who muted notifications
  isArchived?: boolean; // Soft archive for the conversation
  isDeleted?: boolean; // Soft delete flag
  createdAt: Date;
  updatedAt: Date;
}
