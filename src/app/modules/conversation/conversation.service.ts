import Conversation from './conversation.model';

export const ConversationServices = {
  // Create or get existing conversation between participants
  async createConversation(participantIds: string[]) {
    // Ensure participantIds are unique
    const uniqueParticipants = Array.from(new Set(participantIds));

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: {
        $all: uniqueParticipants,
        $size: uniqueParticipants.length,
      },
    });

    if (conversation) return conversation;

    // Create new conversation
    conversation = await Conversation.create({
      participants: uniqueParticipants,
    });

    return conversation;
  },

  // Block a user in a conversation
  async blockUser(conversationId: string, userId: string) {
    return Conversation.findByIdAndUpdate(
      conversationId,
      {
        $addToSet: { blockedBy: userId },
      },
      { new: true },
    );
  },

  // Unblock a user in a conversation
  async unblockUser(conversationId: string, userId: string) {
    return Conversation.findByIdAndUpdate(
      conversationId,
      {
        $pull: { blockedBy: userId },
      },
      { new: true },
    );
  },

  // Get all conversations for a user
  async getUserConversations(userId: string) {
    return Conversation.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .populate('participants', 'name email')
      .populate('lastMessage');
  },
};
