// import { Server, Socket } from 'socket.io';
// import http from 'http';
// import AppError from '../error/appError';

// let io: Server | null = null;

// interface JoinChatPayload {
//   chatId: string;
// }

// export const initSocket = (httpServer: http.Server): Server => {
//   if (io) return io;

//   io = new Server(httpServer, {
//     cors: { origin: '*', methods: ['GET', 'POST'] },
//   });
//   // Socket event handlers
//   //*******mahabur */

//    io.on('connection', (socket) => {
//     logger.info(`🟢 User connected: ${socket.id}`);
//     socketHandler(io, socket);
//   });

//   io.on('connection', (socket: Socket) => {
//     console.log('🔌 Socket connected:', socket.id);

//     // Personal room
//     const userId = socket.handshake.query?.userId as string | undefined;
//     if (userId) {
//       socket.join(userId);
//       console.log('👤 User joined personal room:', userId);
//     }

//     // Join chat
//     socket.on('joinChat', ({ chatId }: JoinChatPayload) => {
//       if (!chatId) return;
//       socket.join(chatId);
//       console.log(`💬 Joined chat room: ${chatId}`);
//     });

//     // Leave chat
//     socket.on('leaveChat', ({ chatId }: JoinChatPayload) => {
//       if (!chatId) return;
//       socket.leave(chatId);
//       console.log(`🚪 Left chat room: ${chatId}`);
//     });

//     // // Typing
//     // socket.on('typing', ({ chatId, userId }: TypingPayload) => {
//     //   if (!chatId || !userId) return;
//     //   socket.broadcast.to(chatId).emit('typing', { userId });
//     // });

//     // socket.on('stopTyping', ({ chatId, userId }: TypingPayload) => {
//     //   if (!chatId || !userId) return;
//     //   socket.broadcast.to(chatId).emit('stopTyping', { userId });
//     // });

//     // // New message
//     // socket.on('newMessage', ({ chatId, userId, content }: MessagePayload) => {
//     //   if (!chatId || !userId || !content) return;

//     //   console.log(
//     //     `📩 New message from ${userId} in chat ${chatId}: ${content}`,
//     //   );

//     //   // Broadcast to room
//     //   socket.to(chatId).emit('newMessage', {
//     //     chatId,
//     //     userId,
//     //     content,
//     //     timestamp: new Date().toISOString(),
//     //   });
//     // });

//     // Disconnect
//     socket.on('disconnect', () => {
//       console.log('❌ Socket disconnected:', socket.id);
//     });
//   });

//   return io;
// };

// export const getIo = (): Server => {
//   if (!io) throw new AppError(500, 'Socket not initialized');
//   return io;
// };


import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { socketHandler } from './socketService';

export const initSocket = (server: HTTPServer): Server => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log(`🟢 User connected: ${socket.id}`);
    socketHandler(io, socket);
  });

  console.log('✅ Socket.IO initialized');
  return io;
};