import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ConversationServices } from './conversation.service';

// Create a new conversation
export const createConversation = catchAsync(async (req, res) => {
  const { participantIds } = req.body;

  if (!participantIds || !participantIds.length) {
    throw new Error('Participants are required to create a conversation');
  }

  // Include current user
  const participants = [...participantIds, req.user.id];

  const conversation =
    await ConversationServices.createConversation(participants);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Conversation created successfully',
    data: conversation,
  });
});

// Block a user
export const blockUser = catchAsync(async (req, res) => {
  const { conversationId, userId } = req.body;

  const updatedConversation = await ConversationServices.blockUser(
    conversationId,
    userId,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User blocked successfully',
    data: updatedConversation,
  });
});

// Unblock a user
export const unblockUser = catchAsync(async (req, res) => {
  const { conversationId, userId } = req.body;

  const updatedConversation = await ConversationServices.unblockUser(
    conversationId,
    userId,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User unblocked successfully',
    data: updatedConversation,
  });
});

// Get all conversations of current user
export const getUserConversations = catchAsync(async (req, res) => {
  const conversations = await ConversationServices.getUserConversations(
    req.user.id,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Conversations fetched successfully',
    data: conversations,
  });
});
