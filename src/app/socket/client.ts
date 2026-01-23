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
const USER_ID = '69680f25fda92b3c5a16e4ca';
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

//new booking
socket.on('newBooking', (data) => {
  const message = `Congratulations! ${data.customer.name} booked your service "${data.service.title}"`;
  // console.log('New Booking:', data);
  console.log(message);
});

// Listen for new messages
socket.on('newMessage', (data: MessagePayload) => {
  console.log(
    `📩 New message from ${data?.sender?.name || 'Sender'}: ${data?.content}`,
  );
});

//new comment on review
socket.on('newComment', (data) => {
  // console.log('New Comment:', data);
  const message = `You received a new review for "${data.serviceId.title}" from ${data.userId.name}.`;
  console.log(message);
});

//accepted booking request
socket.on('acceptRequest', (data) => {
  console.log(data);
  const message = `Your booking request for  has been accepted by .`;
  console.log(message);
});

//delete message
socket.on('deleteMessage', (data: MessagePayload) => {
  console.log(`🗑️ Message deleted by ${data?.sender?.name}: ${data?.content}`);
});

socket.on('disconnect', () => console.log('❌ Disconnected from server'));
