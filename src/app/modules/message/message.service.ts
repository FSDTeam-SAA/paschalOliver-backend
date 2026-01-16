import AppError from '../../error/appError';
import { Message } from './message.model';
import Conversation from '../conversation/conversation.model';
import { Types } from 'mongoose';
import { fileUploader } from '../../helper/fileUploder';

const sendMessage = async (
  senderId: string,
  conversationId: string,
  receiverId: string,
  content?: string,
  attachments?: string[],
  image?: Express.Multer.File,
) => {
  // Find conversation
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new AppError(404, 'Conversation not found');
  }

  // Check if user is a participant
  if (!conversation.participants.includes(new Types.ObjectId(senderId))) {
    throw new AppError(403, 'You are not a participant of this conversation');
  }

  // Create message
  const createdMessage = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    receiver: receiverId,
    content,
    attachments: attachments || [],
    isRead: false,
  });

  //upload to cloudinary
  const messageImage = await fileUploader.uploadToCloudinary(
    image as Express.Multer.File,
  );
  if (image)
    createdMessage.image = {
      url: messageImage.url,
      public_id: messageImage.public_id,
    };
  await createdMessage.save();

  const message = await Message.findById(createdMessage._id)
    .populate('sender', 'name email image')
    .populate('receiver', 'name email image');

  // Update lastMessage in conversation
  conversation.lastMessage = createdMessage._id;
  await conversation.save();

  return message;
};

const getMessages = async (conversationId: string, userId: string) => {
  // Check if conversation exists
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new AppError(404, 'Conversation not found');
  }

  // Check if user is a participant
  if (!conversation.participants.includes(userId as any)) {
    throw new AppError(403, 'You are not a participant of this conversation');
  }

  // get messages
  const messages = await Message.find({
    conversation: conversationId,
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .populate('sender', 'name email image')
    .populate('receiver', 'name email image')
    .populate({
      path: 'attachments',
      select: 'name size url',
    });

  if (!messages.length) {
    throw new AppError(404, 'Messages not found');
  }

  return messages;
};

const markMessageAsRead = async (messageId: string, userId: string) => {
  const message = await Message.findByIdAndUpdate(
    { _id: messageId, receiver: userId },
    { isRead: true },
    { new: true },
  );

  if (!message) {
    throw new AppError(404, 'Message not found');
  }

  return message;
};

const deleteMessage = async (messageId: string) => {
  const message = await Message.findOne({ _id: messageId, isDeleted: false });
  if (!message) {
    throw new AppError(404, 'Message not found');
  }
  message.isDeleted = true;
  await message.save();
  return message;
};

export const MessageServices = {
  sendMessage,
  getMessages,
  markMessageAsRead,
  deleteMessage,
};
