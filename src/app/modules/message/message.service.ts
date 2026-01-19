import AppError from '../../error/appError';
import { Message } from './message.model';
import Conversation from '../conversation/conversation.model';
import { Types } from 'mongoose';
import { fileUploader } from '../../helper/fileUploder';
import { getIo } from '../../socket/server';

const sendMessage = async (
  senderId: string,
  conversationId: string,
  receiverId: string,
  content?: string,
  attachments?: string[],
  image?: Express.Multer.File,
) => {
  // Find conversation
  const conversation =
    await Conversation.findById(conversationId).populate('participants');
  if (!conversation) {
    throw new AppError(404, 'Conversation not found');
  }

  console.log(conversation);
  // Check if user is a participant
  const isParticipant = conversation.participants.some((participant: any) =>
    participant._id.equals(new Types.ObjectId(senderId)),
  );

  if (!isParticipant) {
    throw new AppError(403, 'You are not a participant of this conversation');
  }

  // check user is block or not
  const senderObjectId = new Types.ObjectId(senderId);

  const blockEntry = conversation.blockedUsers?.find(
    (item: any) =>
      item.blocker.equals(senderObjectId) ||
      item.blocked.equals(senderObjectId),
  );

  if (blockEntry) {
    // Sender is the blocked person
    if (blockEntry.blocked.equals(senderObjectId)) {
      throw new AppError(403, 'You are blocked');
    }

    // Sender is the blocker
    if (blockEntry.blocker.equals(senderObjectId)) {
      throw new AppError(403, 'You have blocked this user');
    }
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
  if (image) {
    const messageImage = await fileUploader.uploadToCloudinary(
      image as Express.Multer.File,
    );
    if (messageImage)
      createdMessage.image = {
        url: messageImage.url,
        public_id: messageImage.public_id,
      };
    await createdMessage.save();
  }

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

const deleteMessage = async (messageId: string, req: string) => {
  const message = await Message.findOne({
    _id: messageId,
    $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
  }).populate('sender', 'name email image');

  if (!message) {
    throw new AppError(404, 'Message not found');
  }

  if (!message.sender._id.equals(req.toString())) {
    throw new AppError(403, 'You are not authorized to delete this message');
  }

  message.isDeleted = true;
  await message.save();
  getIo()
    .to(new Types.ObjectId(message.receiver).toString())
    .emit('deleteMessage', {
      _id: message._id,
      conversation: message.conversation,
      sender: message.sender,
      receiver: message.receiver,
      content: message.content,
      attachments: message.attachments,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      isDeleted: message.isDeleted,
    });
  return message;
};

const hardDeleteMessage = async (messageId: string) => {
  const message = await Message.findOneAndDelete({ _id: messageId });
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
  hardDeleteMessage,
};
