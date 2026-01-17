import mongoose, { Types } from 'mongoose';
import Conversation from './conversation.model';
import AppError from '../../error/appError';
import { Message } from '../message/message.model';

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
    })
      .sort({ updatedAt: -1 })
      .populate('participants', 'name email')
      .populate('lastMessage');
  },
  // Soft delete a conversation and its messages using a transaction
  async deleteConversation(conversationId: string, userId: string) {
    // Validate IDs
    if (
      !Types.ObjectId.isValid(conversationId) ||
      !Types.ObjectId.isValid(userId)
    ) {
      throw new AppError(400, 'Invalid ID provided');
    }

    // Start a MongoDB session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find conversation
      const conversation =
        await Conversation.findById(conversationId).session(session);
      if (!conversation) {
        throw new AppError(404, 'Conversation not found');
      }

      // Check if user is a participant
      const isParticipant = conversation.participants.some((id) =>
        id.equals(userId),
      );
      if (!isParticipant) {
        throw new AppError(
          403,
          'You are not a participant of this conversation',
        );
      }

      // Soft delete the conversation
      conversation.isDeleted = true;
      await conversation.save({ session });

      // Soft delete all messages in the conversation
      await Message.updateMany(
        { conversation: conversation._id },
        { $set: { isDeleted: true } },
        { session },
      );

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return conversation;
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },
};
