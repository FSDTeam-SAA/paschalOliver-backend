import { Schema, model, Types } from 'mongoose';
import { IConversation } from './conversation.interface';

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: Types.ObjectId, ref: 'Message' },

    blockedBy: [{ type: Types.ObjectId, ref: 'User', default: [] }], // User IDs who blocked the chat
    mutedBy: [{ type: Types.ObjectId, ref: 'User', default: [] }], // User IDs who muted notifications
    isArchived: { type: Boolean, default: false }, // Conversation archived flag
    isDeleted: { type: Boolean, default: false }, // Soft delete flag
  },
  { timestamps: true },
);

const Conversation = model<IConversation>('Conversation', conversationSchema);
export default Conversation;
