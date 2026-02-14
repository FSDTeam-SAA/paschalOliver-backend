import AppError from '../../error/appError';
import { Message } from './message.model';
import Conversation from '../conversation/conversation.model';
import mongoose, { Types } from 'mongoose';
import { fileUploader } from '../../helper/fileUploder';
// import { getIo } from '../../socket/server';
import { User } from '../user/user.model';
import Handyman from '../handyman/handyman.model';

const sendMessage = async (
  senderId: string,
  conversationId: string,
  receiverId: string,
  message?: string,
  attachments: string[] = [],
  image?: Express.Multer.File,
  bookingId?: string,
  req?: any,
) => {
  if (!receiverId) {
    throw new AppError(400, 'receiverId is required');
  }
  const sender = await User.findById(senderId);
  if (!sender) throw new AppError(404, 'Sender not found');
  const receiver = await User.findById(receiverId);
  if (!receiver) throw new AppError(404, 'Receiver not found');
  
  const createdMessage = await Message.create({
    conversation: conversationId,
    sender: senderId,
    receiver: receiverId,
    message: message?.trim(),
    attachments,
    isRead: false,
    ...(bookingId && { bookingId }),
  });
  
  if (image) {
    const uploaded = await fileUploader.uploadToCloudinary(image);
    if (uploaded) {
      createdMessage.image = {
        url: uploaded.url,
        public_id: uploaded.public_id,
      };
      await createdMessage.save();
    }
  }
  
  // Emit socket event if io is available
  if (req?.app?.get('io') && senderId && receiverId) {
    console.log("✅ Emitting to booking room:", senderId + ":" + receiverId);
    const io = req.app.get('io');
    const ids = [senderId, receiverId].sort();
    
    // ✅ FIXED: Use parentheses, not backticks
    io.to(`chat:${ids[0]}:${ids[1]}`).emit('receive-message', {
      bookingId,
      senderId,
      receiverId,
      message: createdMessage.message || '',
      attachments: createdMessage.attachments || [],
      image: createdMessage.image || null,
      timestamp: createdMessage.createdAt,
    });
    console.log("✅ Message emitted successfully");
  } else {
    console.log("⚠️ Socket.IO not available or no bookingId");
  }
  
  return Message.findById(createdMessage._id)
    .populate('sender', 'name email image')
    .populate('receiver', 'name email image');
};


const getMessages = async (bookingId: string, userId: string) => {
  
  // Check if conversation exists
  // const conversation = await Message.findOne({ bookingId: bookingId });
  // if (!conversation) {
  //   throw new AppError(404, 'Conversation not found');
  // }

  // Check if user is a participant
    // if (!conversation.participants.includes(userId as any)) {
    //   throw new AppError(403, 'You are not a participant of this conversation');
    // }

  // get messages
  const messages = await Message.find({
    bookingId: bookingId,
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
  // getIo()
  //   .to(new Types.ObjectId(message.receiver).toString())
  //   .emit('deleteMessage', {
  //     _id: message._id,
  //     conversation: message.conversation,
  //     sender: message.sender,
  //     receiver: message.receiver,
  //     content: message.content,
  //     attachments: message.attachments,
  //     createdAt: message.createdAt,
  //     updatedAt: message.updatedAt,
  //     isDeleted: message.isDeleted,
  //   });
  // return message;
};

const hardDeleteMessage = async (messageId: string) => {
  const message = await Message.findOneAndDelete({ _id: messageId });
  if (!message) {
    throw new AppError(404, 'Message not found');
  }
  return message;
};

const getCommunicatedUsersWithLastMessage = async (userId: string) => {
  const objectUserId = new mongoose.Types.ObjectId(userId);

  const result = await Message.aggregate([
    {
      $match: {
        isDeleted: false,
        $or: [{ sender: objectUserId }, { receiver: objectUserId }],
      },
    },

    { $sort: { createdAt: -1 } },

    {
      $addFields: {
        otherUserId: {
          $cond: [
            { $eq: ['$sender', objectUserId] },
            '$receiver',
            '$sender',
          ],
        },
      },
    },

    {
      $group: {
        _id: '$otherUserId',
        lastMessage: { $first: '$$ROOT' },
      },
    },

    {
      $lookup: {
        from: 'users',           
        localField: '_id',       
        foreignField: '_id',
        as: 'user',
      },
    },

    { $unwind: '$user' },

    {
      $project: {
        'user.password': 0,
        'user.__v': 0,
        'lastMessage.__v': 0,
      },
    },

    { $sort: { 'lastMessage.createdAt': -1 } },
  ]);

  return result;
};



export const MessageServices = {
  sendMessage,
  getMessages,
  markMessageAsRead,
  deleteMessage,
  hardDeleteMessage,
  getCommunicatedUsersWithLastMessage,
};
