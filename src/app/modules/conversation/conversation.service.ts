import { Types } from 'mongoose';
import Conversation from './conversation.model';
import AppError from '../../error/appError';

export const ConversationServices = {
  // Create or get existing conversation between participants
  async createConversation(participantIds: string[]) {
    const uniqueParticipants = Array.from(new Set(participantIds));

    let conversation = await Conversation.findOne({
      participants: {
        $all: uniqueParticipants,
        $size: uniqueParticipants.length,
      },
    });

    if (conversation) return conversation;

    conversation = await Conversation.create({
      participants: uniqueParticipants,
    });

    return conversation;
  },

  // ✅ Block a user in a conversation
  async blockUser(
    conversationId: string,
    blockerId: string,
    blockedUserId: string,
  ) {
    // Validate IDs
    if (
      !Types.ObjectId.isValid(conversationId) ||
      !Types.ObjectId.isValid(blockerId) ||
      !Types.ObjectId.isValid(blockedUserId)
    ) {
      throw new AppError(400, 'Invalid ID provided');
    }

    if (blockerId === blockedUserId) {
      throw new AppError(400, 'You cannot block yourself');
    }

    // Ensure both users are participants
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: { $all: [blockerId, blockedUserId] },
    });

    if (!conversation) {
      throw new AppError(
        403,
        'Both users must be participants of this conversation',
      );
    }

    // Prevent duplicate block
    const alreadyBlocked = conversation.blockedUsers?.some(
      (b) =>
        b.blocker.toString() === blockerId &&
        b.blocked.toString() === blockedUserId,
    );

    if (alreadyBlocked) {
      throw new AppError(400, 'User already blocked');
    }

    // Add block
    return Conversation.findByIdAndUpdate(
      conversationId,
      {
        $push: {
          blockedUsers: {
            blocker: blockerId,
            blocked: blockedUserId,
            blockedAt: new Date(),
          },
        },
      },
      { new: true },
    );
  },

  // Unblock a user in a conversation
  //! need update FOR UNBLOCK USER ONLY WHO CAN BLOCK
  async unblockUser(
    conversationId: string,
    blockerId: string,
    blockedUserId: string,
  ) {
    // Validate IDs
    if (
      !Types.ObjectId.isValid(conversationId) ||
      !Types.ObjectId.isValid(blockerId) ||
      !Types.ObjectId.isValid(blockedUserId)
    ) {
      throw new AppError(400, 'Invalid ID provided');
    }

    // Ensure this block exists AND requester is the blocker
    const conversation = await Conversation.findOne({
      _id: conversationId,
      blockedUsers: {
        $elemMatch: {
          blocker: blockerId,
          blocked: blockedUserId,
        },
      },
    });

    if (!conversation) {
      throw new AppError(403, 'You can only unblock users you have blocked');
    }

    // Remove block
    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $pull: {
          blockedUsers: {
            blocker: blockerId,
            blocked: blockedUserId,
          },
        },
      },
      { new: true },
    );

    return updatedConversation;
  },
  async getUserConversations(userId: string) {
    return Conversation.find({
      participants: userId,
      isDeleted: false,
    })
      .sort({ updatedAt: -1 })
      .populate('participants', 'name email')
      .populate('lastMessage');
  },
};
