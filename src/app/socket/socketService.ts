// import { Server, Socket } from 'socket.io';
// import {
//   handleJoinUser,
//   handleJoinChat,
//   handleSendMessage,
//   handleLeaveChat,
//   handleJoinProfessional,
//   handleDisconnect,
// } from './socketEvents';

// interface CustomSocket extends Socket {
//   clientId?: string;
//   professionalId?: string;
//   bookingId?: string;
// }

// export const socketHandler = (io: Server, socket: CustomSocket): void => {
//   console.log(`🟢 New socket connection: ${socket.id}`);
  
//   // User joins their personal room
//   socket.on('join-client', (data: { clientId: string }) => {
//     if (data.clientId) {
//       console.log('User ID:', data.clientId);
//       handleJoinUser(socket, data.clientId);
//     } else {
//       console.log('❌ Join event received without clientId');
//     }
//   });

//   // Driver joins tracking system
//   socket.on('join-professional', (data: string | { professionalId?: string; id?: string; _id?: string }) => {
//     let professionalId: string | null = null;
    
//     if (typeof data === 'string') {
//       professionalId = data;
//     } else if (data && typeof data === 'object') {
//       professionalId = data.professionalId || data.id || data._id || null;
//     }
    
//     if (!professionalId) {
//       console.log('❌ join-professional event received without valid professionalId');
//       return;
//     }
    
//     console.log('✅ Professional ID extracted:', professionalId);
//     handleJoinProfessional(socket, professionalId);
//   });

//   // User joins a specific chat room
//   socket.on('join-chat', (data: { bookingId: string }) => {
//     handleJoinChat(socket, data);
//   });

//   // User leaves a chat room
//   socket.on('leave-chat', (data: { bookingId: string }) => {
//     handleLeaveChat(socket, data);
//   });

//   // Handle new message
//   socket.on('send-message', (data: { bookingId : string; message: string }) => {
//     handleSendMessage(io, socket, data);
//   });

//   // Handle disconnect
//   socket.on('disconnect', () => {
//     console.log(`🔴 User disconnected: ${socket.id}`);
    
//     if (socket.bookingId) {
//       socket.leave(`booking:${socket.bookingId}`);
//     }
    
//     handleDisconnect(socket);
//   });

//   // Handle errors
//   socket.on('error', (error: Error) => {
//     console.log('❌ Socket error:', error);
//   });
// };


// import { Server, Socket } from 'socket.io';
// import {
//   handleJoinUser,
//   handleJoinChat,
//   handleSendMessage,
//   handleLeaveChat,
//   handleJoinProfessional,
//   handleDisconnect,
// } from './socketEvents';

// interface CustomSocket extends Socket {
//   clientId?: string;
//   professionalId?: string;
//   bookingId?: string;
// }

// export const socketHandler = (io: Server, socket: CustomSocket): void => {
//   console.log(`🟢 New socket connection: ${socket.id}`);
  
//   // User joins their personal room
//   socket.on('join-client', (data: { clientId: string }) => {
//     if (data.clientId) {
//       console.log('User ID:', data.clientId);
//       handleJoinUser(socket, data.clientId);
//     } else {
//       console.log('❌ Join event received without clientId');
//     }
//   });

//   // Professional joins tracking system
//   socket.on('join-professional', (data: string | { professionalId?: string; id?: string; _id?: string }) => {
//     let professionalId: string | null = null;
    
//     if (typeof data === 'string') {
//       professionalId = data;
//     } else if (data && typeof data === 'object') {
//       professionalId = data.professionalId || data.id || data._id || null;
//     }
    
//     if (!professionalId) {
//       console.log('❌ join-professional event received without valid professionalId');
//       return;
//     }
    
//     console.log('✅ Professional ID extracted:', professionalId);
//     handleJoinProfessional(socket, professionalId);
//   });

//   // User joins a specific chat room
//   socket.on('join-chat', (data: { bookingId: string }) => {
//     handleJoinChat(socket, data);
//   });

//   // User leaves a chat room
//   socket.on('leave-chat', (data: { bookingId: string }) => {
//     handleLeaveChat(socket, data);
//   });

//   // Handle new message
//   socket.on('send-message', (data: { bookingId: string; message: string }) => {
//     handleSendMessage(io, socket, data);
//   });

//   // Handle disconnect
//   socket.on('disconnect', () => {
//     console.log(`🔴 User disconnected: ${socket.id}`);
    
//     if (socket.bookingId) {
//       socket.leave(`booking:${socket.bookingId}`);
//     }
    
//     handleDisconnect(socket);
//   });

//   // Handle errors
//   socket.on('error', (error: Error) => {
//     console.log('❌ Socket error:', error);
//   });
// };

import { Server, Socket } from 'socket.io';
import {
  handleJoinUser,
  handleJoinChat,
  handleSendMessage,
  handleLeaveChat,
  handleJoinProfessional,
  handleDisconnect,
} from './socketEvents';

interface CustomSocket extends Socket {
  clientId?: string;
  professionalId?: string;
  bookingId?: string;
}

export const socketHandler = (io: Server, socket: CustomSocket): void => {
  console.log(`🟢 New socket connection: ${socket.id}`);
  
  // User joins their personal room
  socket.on('join-client', (data: { clientId: string }) => {
    if (data.clientId) {
      console.log('User ID:', data.clientId);
      handleJoinUser(socket, data.clientId);
    } else {
      console.log('❌ Join event received without clientId');
    }
  });

  // Professional joins tracking system
  socket.on('join-professional', (data: string | { professionalId?: string; id?: string; _id?: string }) => {
    let professionalId: string | null = null;
    
    if (typeof data === 'string') {
      professionalId = data;
    } else if (data && typeof data === 'object') {
      professionalId = data.professionalId || data.id || data._id || null;
    }
    
    if (!professionalId) {
      console.log('❌ join-professional event received without valid professionalId');
      return;
    }
    
    console.log('✅ Professional ID extracted:', professionalId);
    handleJoinProfessional(socket, professionalId);
  });

  // User joins a specific chat room (UPDATED: now uses clientId and professionalId)
  socket.on('join-chat', (data: { clientId: string; professionalId: string }) => {
    if (!data.clientId || !data.professionalId) {
      console.log('❌ join-chat event received without clientId or professionalId');
      socket.emit('error', { message: 'Missing clientId or professionalId' });
      return;
    }
    console.log('📥 join-chat event:', data);
    handleJoinChat(socket, data);
  });

  // User leaves a chat room (UPDATED: now uses clientId and professionalId)
  socket.on('leave-chat', (data: { clientId: string; professionalId: string }) => {
    if (!data.clientId || !data.professionalId) {
      console.log('❌ leave-chat event received without clientId or professionalId');
      return;
    }
    console.log('📤 leave-chat event:', data);
    handleLeaveChat(socket, data);
  });

  // Handle new message (UPDATED: now uses clientId and professionalId)
  socket.on('send-message', (data: { clientId: string; professionalId: string; message: string }) => {
    if (!data.clientId || !data.professionalId || !data.message) {
      console.log('❌ send-message event received with missing fields');
      socket.emit('error', { message: 'Missing required fields: clientId, professionalId, or message' });
      return;
    }
    console.log('💬 send-message event:', { 
      clientId: data.clientId, 
      professionalId: data.professionalId, 
      messageLength: data.message.length 
    });
    handleSendMessage(io, socket, data);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
    
    // Clean up any chat rooms the socket was in
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => {
      if (room.startsWith('chat:')) {
        socket.leave(room);
        console.log(`👋 Socket left room: ${room}`);
      }
    });
    
    handleDisconnect(socket);
  });

  // Handle errors
  socket.on('error', (error: Error) => {
    console.log('❌ Socket error:', error);
  });
};