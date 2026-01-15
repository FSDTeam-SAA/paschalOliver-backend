import { io as socketIoClient, Socket } from 'socket.io-client';

interface TypingPayload {
  chatId: string;
  userId: string;
}

interface MessagePayload {
  chatId: string;
  userId: string;
  content: string;
  timestamp?: string;
}

const SERVER_URL = 'http://localhost:5000';
const USER_ID = '6967b0405f4b11f33de85641';
const CHAT_ID = 'chat123';

const socket: Socket = socketIoClient(SERVER_URL, {
  query: { userId: USER_ID },
});
console.log("From client");

socket.on('connect', () => {
  console.log('✅ Connected to server:', socket.id);

  // Join chat
  socket.emit('joinChat', { chatId: CHAT_ID });

  // Typing example
  const typingPayload: TypingPayload = { chatId: CHAT_ID, userId: USER_ID };
  socket.emit('typing', typingPayload);

  setTimeout(() => {
    socket.emit('stopTyping', typingPayload);
  }, 3000);


});

// Listen for typing events
socket.on('typing', ({ userId }) => console.log(`👀 ${userId} is typing...`));
socket.on('stopTyping', ({ userId }) =>
  console.log(`✋ ${userId} stopped typing`),
);

// Listen for new messages
socket.on('newMessage', (data: MessagePayload) => {
  console.log(data);
  
  console.log(`📩 New message from ${data.userId}: ${data.content}`);
});

socket.on('disconnect', () => console.log('❌ Disconnected from server'));
