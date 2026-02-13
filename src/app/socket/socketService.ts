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

  // User joins a specific chat room
  socket.on('join-chat', (data: { bookingId: string }) => {
    handleJoinChat(socket, data);
  });

  // User leaves a chat room
  socket.on('leave-chat', (data: { bookingId: string }) => {
    handleLeaveChat(socket, data);
  });

  // Handle new message
  socket.on('send-message', (data: { bookingId: string; message: string }) => {
    handleSendMessage(io, socket, data);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
    
    if (socket.bookingId) {
      socket.leave(`booking:${socket.bookingId}`);
    }
    
    handleDisconnect(socket);
  });

  // Handle errors
  socket.on('error', (error: Error) => {
    console.log('❌ Socket error:', error);
  });
};