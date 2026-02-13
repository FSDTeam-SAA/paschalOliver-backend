// import { Server, Socket } from 'socket.io';
// import { JoinDriverData } from '../interface/socketTypes';
// import Handyman from '../modules/handyman/handyman.model';
// import { Message } from '../modules/message/message.model';



// // Types
// interface JoinUserData {
//   userId: string;
// }

// interface JoinProfessionalData {
//   professionalId?: string;
//   id?: string;
//   _id?: string;
// }

// interface JoinChatData {
//   bookingId: string;
// }

// interface SendMessageData {
//   bookingId: string;
//   message: string;
// }


// // Extend Socket type with custom properties
// interface CustomSocket extends Socket {
//   clientId?: string;
//   professionalId?: string;
//   bookingId?: string;
// }

// const extractUserId = (socket: CustomSocket): string | null => {
//   let userId = socket.clientId || socket.professionalId;
  
//   if (typeof userId === 'object' && userId !== null) {
//     userId = (userId as any).driverId || (userId as any).userId;
//   }
  
//   return userId?.toString() || null;
// };

// export const handleJoinUser = (socket: CustomSocket, userId: string): void => {
//   if (!userId) {
//     console.log('❌ Join event without userId');
//     return;
//   }

//   const userRoom = `user:${userId}`;
//   socket.join(userRoom);
//   socket.clientId = userId;
  
//   console.log(`👤 User ${userId} joined personal room: ${userRoom}`);
  
//   socket.emit('joined', {
//     success: true,
//     room: userRoom,
//     message: 'Successfully joined user room'
//   });
// };

// export const handleJoinProfessional = (socket: CustomSocket, professionalIdOrData: string | JoinProfessionalData): void => {
//   let professionalId: string | undefined;
  
//   if (typeof professionalIdOrData === 'object' && professionalIdOrData !== null) {
//     professionalId = professionalIdOrData.professionalId || professionalIdOrData.id || professionalIdOrData._id;
//   } else {
//     professionalId = professionalIdOrData;
//   }
  
//   if (!professionalId) {
//     console.log('❌ join-professional event without professionalId');
//     return;
//   }

//   const professionalIdStr = String(professionalId);
//   const professionalRoom = `professional:${professionalIdStr}`;
  
//   socket.join(professionalRoom);
//   socket.professionalId = professionalIdStr;
  
//   const rooms = Array.from(socket.rooms);
//   console.log(`🚗 Professional ${professionalIdStr} joined room: ${professionalRoom}`);
//   console.log(`📋 All rooms for this socket: ${JSON.stringify(rooms)}`);
  
//   socket.emit('professional-joined', {
//     success: true,
//     room: professionalRoom,
//     message: 'Successfully joined professional room',
//     allRooms: rooms
//   });
// };

// export const handleJoinChat = async (socket: CustomSocket, data: JoinChatData): Promise<void> => {
//   const { bookingId } = data;
//   const userId = extractUserId(socket);

//   console.log('🔵 Join chat attempt:', { bookingId, userId });

//   if (!bookingId || !userId) {
//     console.log('❌ Missing bookingId or userId');
//     return;
//   }

//   const handymanRequest = await Handyman.findById(bookingId);
//   if (!handymanRequest) {
//     console.log('❌ Handyman request not found:', bookingId);
//     return;
//   }

//   if (
//     handymanRequest.userId.toString() !== userId &&
//     (!handymanRequest.professionalId || handymanRequest.professionalId.toString() !== userId)
//   ) {
//     console.log('❌ User not participant in booking');
//     return;
//   }

//   socket.join(`booking:${bookingId}`);
//   console.log(`✅ Joined booking room: booking:${bookingId} by user: ${userId}`);
//   socket.emit('joined-chat', { bookingId });
// };

// export const handleSendMessage = async (io: Server, socket: CustomSocket, data: SendMessageData): Promise<void> => {
//   try {
//     const { bookingId, message } = data;
//     const senderId = extractUserId(socket);

//     console.log('📨 Send message:', { bookingId, senderId, messagePreview: message?.substring(0, 30) });

//     if (!bookingId || !senderId || !message) {
//       console.log('❌ Missing required fields');
//       return;
//     }

//     const handymanRequest = await Handyman.findById(bookingId);
//     if (!handymanRequest) {
//       console.log('❌ Handyman request not found');
//       return;
//     }

//     console.log(handymanRequest, "🔍 Handyman request details");
//     const customerId = handymanRequest.userId.toString();
//     const professionalId = (!handymanRequest.professionalId || handymanRequest.professionalId.toString())
//     const receiverId = senderId === customerId ? professionalId : customerId;

//     console.log('👥 Participants:', { customerId, professionalId, senderId, receiverId });

//     if (senderId !== customerId && senderId !== professionalId) {
//       console.log('❌ Unauthorized sender');
//       socket.emit('error', { message: 'Unauthorized message' });
//       return;
//     }

//     const newMessage = await Message.create({
//       bookingId ,
//       sender: senderId,
//       receiver: receiverId,
//       message,
//     });
    
//     console.log('📤 Emitting to room:', { bookingRoom: `booking:${bookingId}` });

//     const messageData = {
//       bookingId,
//       senderId,
//       receiverId,
//       message,
//       timestamp: newMessage.createdAt,
//     };

//     io.to(`booking:${bookingId}`).emit('receive-message', messageData);
//     console.log('✅ Message sent successfully');

//   } catch (err) {
//     console.error('❌ Send message error:', err);
//     socket.emit('error', { message: 'Failed to send message' });
//   }
// };

// export const handleLeaveChat = (socket: CustomSocket, data: { bookingId: string }): void => {
//   try {
//     const { bookingId } = data;
//     socket.leave(`booking:${bookingId}`);
//     console.log(`👋 User left chat room: booking:${bookingId}`);
//   } catch (err) {
//     console.error('⚠️ Error handling leave-chat:', err);
//   }
// };



// export const handleDisconnect = (socket: CustomSocket): void => {
//   const { professionalId, clientId, bookingId } = socket;
  
//   if (professionalId) {
//     console.log(`‍🔧 Professional ${professionalId} disconnected`);
//   }
  
//   if (clientId && bookingId) {
//     console.log(`👤 Customer ${clientId} disconnected from booking ${bookingId}`);
//   }
  
//   delete socket.professionalId;
//   delete socket.clientId;
//   delete socket.bookingId;
// };


import { Server, Socket } from 'socket.io';
import Handyman from '../modules/handyman/handyman.model';
import { Message } from '../modules/message/message.model';

// Types
interface JoinUserData {
  userId: string;
}

interface JoinProfessionalData {
  professionalId?: string;
  id?: string;
  _id?: string;
}

interface JoinChatData {
  bookingId: string;
}

interface SendMessageData {
  bookingId: string;
  message: string;
}

// Extend Socket type with custom properties
interface CustomSocket extends Socket {
  clientId?: string;
  professionalId?: string;
  bookingId?: string;
}

const extractUserId = (socket: CustomSocket): string | null => {
  let userId = socket.clientId || socket.professionalId;
  
  if (typeof userId === 'object' && userId !== null) {
    userId = (userId as any).professionalId || (userId as any).clientId;
  }
  
  return userId?.toString() || null;
};

export const handleJoinUser = (socket: CustomSocket, userId: string): void => {
  if (!userId) {
    console.log('❌ Join event without userId');
    return;
  }

  const userRoom = `user:${userId}`;
  socket.join(userRoom);
  socket.clientId = userId;
  
  console.log(`👤 User ${userId} joined personal room: ${userRoom}`);
  
  socket.emit('joined', {
    success: true,
    room: userRoom,
    message: 'Successfully joined user room'
  });
};

export const handleJoinProfessional = (socket: CustomSocket, professionalIdOrData: string | JoinProfessionalData): void => {
  let professionalId: string | undefined;
  
  if (typeof professionalIdOrData === 'object' && professionalIdOrData !== null) {
    professionalId = professionalIdOrData.professionalId || professionalIdOrData.id || professionalIdOrData._id;
  } else {
    professionalId = professionalIdOrData;
  }
  
  if (!professionalId) {
    console.log('❌ join-professional event without professionalId');
    return;
  }

  const professionalIdStr = String(professionalId);
  const professionalRoom = `professional:${professionalIdStr}`;
  
  socket.join(professionalRoom);
  socket.professionalId = professionalIdStr;
  
  const rooms = Array.from(socket.rooms);
  console.log(`🔧 Professional ${professionalIdStr} joined room: ${professionalRoom}`);
  console.log(`📋 All rooms for this socket: ${JSON.stringify(rooms)}`);
  
  socket.emit('professional-joined', {
    success: true,
    room: professionalRoom,
    message: 'Successfully joined professional room',
    allRooms: rooms
  });
};

export const handleJoinChat = async (socket: CustomSocket, data: JoinChatData): Promise<void> => {
  const { bookingId } = data;
  const userId = extractUserId(socket);

  console.log('🔵 Join chat attempt:', { bookingId, userId });

  if (!bookingId || !userId) {
    console.log('❌ Missing bookingId or userId');
    return;
  }

  const handymanRequest = await Handyman.findById(bookingId);
  if (!handymanRequest) {
    console.log('❌ Handyman request not found:', bookingId);
    return;
  }

  // Check if user is either the customer or the professional
  const isCustomer = handymanRequest.userId.toString() === userId;
  const isProfessional = handymanRequest.professionalId && handymanRequest.professionalId.toString() === userId;

  if (!isCustomer && !isProfessional) {
    console.log('❌ User not participant in booking');
    return;
  }

  socket.join(`booking:${bookingId}`);
  console.log(`✅ Joined booking room: booking:${bookingId} by user: ${userId}`);
  socket.emit('joined-chat', { bookingId });
};

export const handleSendMessage = async (io: Server, socket: CustomSocket, data: SendMessageData): Promise<void> => {
  try {
    const { bookingId, message } = data;
    const senderId = extractUserId(socket);

    console.log('📨 Send message:', { bookingId, senderId, messagePreview: message?.substring(0, 30) });

    if (!bookingId || !senderId || !message) {
      console.log('❌ Missing required fields');
      return;
    }

    const handymanRequest = await Handyman.findById(bookingId);
    if (!handymanRequest) {
      console.log('❌ Handyman request not found');
      return;
    }

    console.log(handymanRequest, "🔍 Handyman request details");
    
    const customerId = handymanRequest.userId.toString();
    // FIX: Corrected the professionalId assignment
    // const professionalId = handymanRequest.professionalId ? handymanRequest.professionalId.toString() : null;
    const professionalId = handymanRequest.professionalId ? 
        handymanRequest.professionalId.toString() : null;
    if (!professionalId) {
        socket.emit('error', { message: 'No professional assigned to this booking' });
        return;
    }
    
    const receiverId = senderId === customerId ? professionalId : customerId;

    console.log('👥 Participants:', { customerId, professionalId, senderId, receiverId });

    if (senderId !== customerId && senderId !== professionalId) {
      console.log('❌ Unauthorized sender');
      socket.emit('error', { message: 'Unauthorized message' });
      return;
    }

    const newMessage = await Message.create({
      bookingId,
      sender: senderId,
      receiver: receiverId,
      message,
    });
    
    console.log('📤 Emitting to room:', { bookingRoom: `booking:${bookingId}` });

    const messageData = {
      bookingId,
      senderId,
      receiverId,
      message,
      timestamp: newMessage.createdAt,
    };

    io.to(`booking:${bookingId}`).emit('receive-message', messageData);
    console.log('✅ Message sent successfully');

  } catch (err) {
    console.error('❌ Send message error:', err);
    socket.emit('error', { message: 'Failed to send message' });
  }
};

export const handleLeaveChat = (socket: CustomSocket, data: { bookingId: string }): void => {
  try {
    const { bookingId } = data;
    socket.leave(`booking:${bookingId}`);
    console.log(`👋 User left chat room: booking:${bookingId}`);
  } catch (err) {
    console.error('⚠️ Error handling leave-chat:', err);
  }
};

export const handleDisconnect = (socket: CustomSocket): void => {
  const { professionalId, clientId, bookingId } = socket;
  
  if (professionalId) {
    console.log(`🔧 Professional ${professionalId} disconnected`);
  }
  
  if (clientId && bookingId) {
    console.log(`👤 Customer ${clientId} disconnected from booking ${bookingId}`);
  }
  
  delete socket.professionalId;
  delete socket.clientId;
  delete socket.bookingId;
};