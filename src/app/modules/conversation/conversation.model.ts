import { Schema, model, Types } from 'mongoose';
import { IConversation } from './conversation.interface';

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Types.ObjectId, ref: 'User', required: true }],

    lastMessage: {
      type: Types.ObjectId,
      ref: 'Message',
    },

    blockedUsers: [
      {
        blocker: {
          type: Types.ObjectId,
          ref: 'User',
          required: true,
        },
        blocked: {
          type: Types.ObjectId,
          ref: 'User',
          required: true,
        },
        blockedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    mutedBy: [{ type: Types.ObjectId, ref: 'User', default: [] }],

    isArchived: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Conversation = model<IConversation>('Conversation', conversationSchema);

export default Conversation;
