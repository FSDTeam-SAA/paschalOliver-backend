import AppError from '../../error/appError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import Conversation from './conversation.model';
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
  const requesterId = req.user.id;

  // 1️⃣ Check conversation exists & requester is a participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: { $all: [requesterId, userId] },
  });

  if (!conversation) {
    throw new AppError(
      403,
      'Both users must be participants of this conversation',
    );
  }

  // 2️⃣ Call service to block
  const updatedConversation = await ConversationServices.blockUser(
    conversationId,
    requesterId,
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
  const blockerId = req.user.id; // from auth middleware

  // Check if the user is actually blocked by the requester
  const conversation = await Conversation.findOne({
    _id: conversationId,
    blockedUsers: {
      $elemMatch: {
        blocker: blockerId,
        blocked: userId,
      },
    },
  });

  if (!conversation) {
    throw new AppError(
      400,
      'User is not blocked or you are not allowed to unblock',
    );
  }

  // Unblock user
  const updatedConversation = await ConversationServices.unblockUser(
    conversationId,
    blockerId,
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
