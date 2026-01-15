import AppError from '../../error/appError';
import { Message } from './message.model';
import Conversation from '../conversation/conversation.model';
import mongoose from 'mongoose';

const sendMessage = async (
  senderId: string,
  conversationId: string,
  receiverId: string,
  content: string,
  attachments?: string[],
) => {
  // 1️⃣ Find conversation
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new AppError(404, 'Conversation not found');
  }

  // 2️⃣ Check if sender is blocked
  if (conversation.blockedBy?.includes(senderId as any)) {
    throw new AppError(
      403,
      'You are blocked from sending messages in this conversation',
    );
  }

  // 3️⃣ Create message
  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    receiver: receiverId,
    content,
    attachments: attachments || [],
    isRead: false,
  });

  // 4️⃣ Update lastMessage in conversation
  conversation.lastMessage = message._id;
  await conversation.save();

  return message;
};

const getMessages = async (conversationId: string, userId: string) => {
  // 1️⃣ Check if conversation exists
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new AppError(404, 'Conversation not found');
  }

  // 2️⃣ Check if user is a participant
  if (!conversation.participants.includes(userId as any)) {
    throw new AppError(403, 'You are not a participant of this conversation');
  }

  // 3️⃣ Aggregation to get messages with populated sender & receiver
  const messages = await Message.aggregate([
    // Match messages in this conversation
    { $match: { conversation: new mongoose.Types.ObjectId(conversationId) } },

    // Sort by creation time ascending
    { $sort: { createdAt: 1 } },

    // Lookup sender details
    {
      $lookup: {
        from: 'users', // collection name in MongoDB
        localField: 'sender',
        foreignField: '_id',
        as: 'sender',
      },
    },
    { $unwind: '$sender' }, // flatten array

    // Lookup receiver details
    {
      $lookup: {
        from: 'users',
        localField: 'receiver',
        foreignField: '_id',
        as: 'receiver',
      },
    },
    { $unwind: '$receiver' }, // flatten array

    // Project only required fields
    {
      $project: {
        _id: 1,
        conversation: 1,
        content: 1,
        attachments: 1,
        isRead: 1,
        createdAt: 1,
        updatedAt: 1,
        'sender._id': 1,
        'sender.name': 1,
        'sender.email': 1,
        'receiver._id': 1,
        'receiver.name': 1,
        'receiver.email': 1,
      },
    },
  ]);

  if (!messages || messages.length === 0) {
    throw new AppError(404, 'No messages found for this conversation');
  }

  return messages;
};

const markMessageAsRead = async (messageId: string) => {
  const message = await Message.findByIdAndUpdate(
    messageId,
    { isRead: true },
    { new: true },
  );

  if (!message) {
    throw new AppError(404, 'Message not found');
  }

  return message;
};

const deleteMessage = async (messageId: string) => {
  const message = await Message.findByIdAndDelete(messageId);
  if (!message) {
    throw new AppError(404, 'Message not found');
  }
  return message;
};

export const MessageServices = {
  sendMessage,
  getMessages,
  markMessageAsRead,
  deleteMessage,
};
