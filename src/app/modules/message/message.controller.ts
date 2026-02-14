// import { getIo } from '../../socket/server';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { MessageServices } from './message.service';

// Send a message
export const sendMessageController = catchAsync(async (req, res) => {
  const senderId = req.user.id;
  const image = req.file;

  const { conversationId, receiverId, message, attachments, bookingId } = req.body;

  //  Save message in DB
  const messageSent = await MessageServices.sendMessage(
    senderId,
    conversationId,
    receiverId,
    message,
    attachments,
    image,
    bookingId,
    req,
  );

  if (!messageSent) {
    throw new Error('Failed to send message');
  }
  //  Send HTTP response
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Message sent successfully',
    data: messageSent,
  });
});

// Get all messages in a conversation
export const getMessagesController = catchAsync(async (req, res) => {
  const receiverId  = req.query.receiverId;
  const userId = req.user.id;
  const messages = await MessageServices.getMessages(userId, receiverId as string);

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

  // if (!deletedMessage) {
  //   throw new Error('Failed to delete message');
  // }

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


export const getCommunicatedUsersController = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const result = await MessageServices.getCommunicatedUsersWithLastMessage(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Communicated users fetched successfully',
    data: result,
  });
});

