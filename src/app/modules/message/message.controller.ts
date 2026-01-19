import { getIo } from '../../socket/server';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { MessageServices } from './message.service';

// Send a message
export const sendMessageController = catchAsync(async (req, res) => {
  const senderId = req.user.id;
  const image = req.file;

  const { conversationId, receiverId, content, attachments } = req.body;

  //  Save message in DB
  const message = await MessageServices.sendMessage(
    senderId,
    conversationId,
    receiverId,
    content,
    attachments,
    image,
  );

  if (!message) {
    throw new Error('Failed to send message');
  }

  // Emit to personal room of receiverId
  getIo().to(receiverId).emit('newMessage', {
    _id: message._id,
    conversation: message.conversation,
    sender: message.sender,
    receiver: message.receiver,
    content: message.content,
    attachments: message.attachments,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  });

  // //  Emit to sender as well if needed (for live UI update)
  // getIo().to(senderId).emit('newMessage', {
  //   _id: message._id,
  //   conversation: message.conversation,
  //   sender: message.sender,
  //   receiver: message.receiver,
  //   content: message.content,
  //   attachments: message.attachments,
  //   isRead: message.isRead,
  //   createdAt: message.createdAt,
  //   updatedAt: message.updatedAt,
  // });

  //  Send HTTP response
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Message sent successfully',
    data: message,
  });
});

// Get all messages in a conversation
export const getMessagesController = catchAsync(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user.id;
  const messages = await MessageServices.getMessages(
    conversationId as string,
    userId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Messages fetched successfully',
    data: messages,
  });
});

// Mark message as read
export const markMessageAsReadController = catchAsync(async (req, res) => {
  const { messageId } = req.params;

  const message = await MessageServices.markMessageAsRead(
    messageId as string,
    req.user.id,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Message marked as read',
    data: message,
  });
});

// Delete a message
export const deleteMessageController = catchAsync(async (req, res) => {
  const { messageId } = req.params;

  const deletedMessage = await MessageServices.deleteMessage(
    messageId as string,req.user.id
  );

  if (!deletedMessage) {
    throw new Error('Failed to delete message');
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Message deleted successfully',
    data: deletedMessage,
  });
});

//hard delete a message
export const hardDeleteMessageController = catchAsync(async (req, res) => {
  const { messageId } = req.params;

  const deletedMessage = await MessageServices.hardDeleteMessage(
    messageId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Message permanently deleted successfully',
    data: deletedMessage,
  });
});
