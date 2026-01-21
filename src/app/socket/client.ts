import { io as socketIoClient, Socket } from 'socket.io-client';

interface MessagePayload {
  chatId: string;
  sender: {
    _id: string;
    name: string;
    email: string;
  };
  reciver: {
    _id: string;
    name: string;
    email: string;
  };
  content?: string;
  attachments?: string[];
  timestamp?: string;
}

const SERVER_URL = 'http://localhost:5000';
const USER_ID = '69710ec73ed8016c2fc651ef';
// const CHAT_ID = 'chat123';

const socket: Socket = socketIoClient(SERVER_URL, {
  query: { userId: USER_ID },
});

socket.on('connect', () => {
  console.log('✅ Connected to server:', socket.id);
});

// Listen for typing events
socket.on('typing', ({ userId }) => console.log(`👀 ${userId} is typing...`));
socket.on('stopTyping', ({ userId }) =>
  console.log(`✋ ${userId} stopped typing`),
);

// Listen for new messages
socket.on('newMessage', (data: MessagePayload) => {
  console.log(
    `📩 New message from ${data?.sender?.name || 'Sender'}: ${data?.content}`,
  );
});

//delete message
socket.on('deleteMessage', (data: MessagePayload) => {
  console.log(`🗑️ Message deleted by ${data?.sender?.name}: ${data?.content}`);
});

socket.on('disconnect', () => console.log('❌ Disconnected from server'));
