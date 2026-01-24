import { io as socketIoClient, Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:5000';
const USER_ID = '69680f25fda92b3c5a16e4ca'; // Change based on role (customer or professional)

const socket: Socket = socketIoClient(SERVER_URL, {
  query: { userId: USER_ID },
});

// ====================================
// CONNECTION EVENTS
// ====================================
socket.on('connect', () => {
  console.log('✅ Connected to server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
});

// ====================================
// BOOKING LIFECYCLE EVENTS
// ====================================

/**
 * 1️⃣ NEW BOOKING (Professional receives when customer books)
 */
socket.on('newBooking', (data) => {
  console.log('🆕 NEW BOOKING RECEIVED!');
  console.log({
    type: data.type,
    bookingId: data.bookingId,
    customer: data.customer.name,
    service: data.service.title,
    date: data.booking.date,
    time: data.booking.startTime,
    amount: data.booking.amount,
  });

  const message = `🎉 Congratulations! ${data.customer.name} booked your "${data.service.title}" service on ${data.booking.date} at ${data.booking.startTime}.`;
  console.log(message);

  // TODO: Show toast notification
  // TODO: Play notification sound
  // TODO: Update booking list in UI
});

/**
 * 2️⃣ BOOKING ACCEPTED (Customer receives when professional accepts)
 */
socket.on('bookingAccepted', (data) => {
  console.log('✅ BOOKING ACCEPTED!');
  console.log({
    type: data.type,
    requestId: data.requestId,
    bookingId: data.bookingId,
    professional: data.professional.name,
    service: data.service.title,
    date: data.booking.date,
    time: data.booking.startTime,
    status: data.status,
  });

  const message = `✅ Great news! ${data.professional.name} accepted your "${data.service.title}" booking on ${data.booking.date} at ${data.booking.startTime}.`;
  console.log(message);

  // TODO: Show success toast
  // TODO: Update booking status in UI
  // TODO: Enable payment option
});

/**
 * 3️⃣ BOOKING REJECTED (Customer receives when professional rejects)
 */
socket.on('bookingRejected', (data) => {
  console.log('❌ BOOKING REJECTED');
  console.log({
    type: data.type,
    requestId: data.requestId,
    bookingId: data.bookingId,
    professional: data.professional.name,
    service: data.service.title,
    date: data.booking.date,
    time: data.booking.startTime,
    status: data.status,
  });

  const message = `😔 ${data.professional.name} couldn't accept your "${data.service.title}" booking. You can try booking another professional.`;
  console.log(message);

  // TODO: Show rejection notification
  // TODO: Update booking status
  // TODO: Show "Find Another Professional" button
});

/**
 * 4️⃣ BOOKING CANCELLED (Professional receives when customer cancels)
 */
socket.on('bookingCancelled', (data) => {
  console.log('🚫 BOOKING CANCELLED');
  console.log({
    type: data.type,
    bookingId: data.bookingId,
    customer: data.customer.name,
    service: data.service.title,
    date: data.booking.date,
    cancelledBy: data.cancelledBy,
    status: data.status,
  });

  const message = `🚫 ${data.customer.name} cancelled their "${data.service.title}" booking on ${data.booking.date}.`;
  console.log(message);

  // TODO: Show cancellation notification
  // TODO: Update booking list
  // TODO: Free up schedule slot
});

/**
 * 5️⃣ BOOKING COMPLETED (Customer receives when professional completes)
 */
socket.on('bookingCompleted', (data) => {
  console.log('✅ BOOKING COMPLETED!');
  console.log({
    type: data.type,
    requestId: data.requestId,
    bookingId: data.bookingId,
    professional: data.professional.name,
    service: data.service.title,
    date: data.booking.date,
    amount: data.booking.amount,
    status: data.status,
  });

  const message = `✅ ${data.professional.name} completed your "${data.service.title}" service. ${data.message}`;
  console.log(message);

  // TODO: Show completion notification
  // TODO: Update booking status
  // TODO: Show review/rating popup
  // TODO: Process payment if not done
});

/**
 * 6️⃣ BOOKING COMPLETED CONFIRMATION (Professional receives confirmation)
 */
socket.on('bookingCompletedConfirmation', (data) => {
  console.log('✅ BOOKING MARKED COMPLETE');
  console.log({
    type: data.type,
    requestId: data.requestId,
    bookingId: data.bookingId,
    customer: data.customer.name,
    service: data.service.title,
    date: data.booking.date,
    amount: data.booking.amount,
    status: data.status,
  });

  const message = `✅ You marked "${data.service.title}" as completed for ${data.customer.name}. Payment pending.`;
  console.log(message);

  // TODO: Show confirmation notification
  // TODO: Update booking list
  // TODO: Show payment status
});

// ====================================
// CHAT EVENTS (Your existing code)
// ====================================

socket.on('typing', ({ userId }) => {
  console.log(`👀 ${userId} is typing...`);
});

socket.on('stopTyping', ({ userId }) => {
  console.log(`✋ ${userId} stopped typing`);
});

socket.on('newMessage', (data) => {
  console.log(
    `📩 New message from ${data?.sender?.name || 'Sender'}: ${data?.content}`,
  );
});

socket.on('deleteMessage', (data) => {
  console.log(`🗑️ Message deleted by ${data?.sender?.name}: ${data?.content}`);
});

// ====================================
// REVIEW EVENTS (Your existing code)
// ====================================

socket.on('newComment', (data) => {
  const message = `💬 You received a new review for "${data.serviceId.title}" from ${data.userId.name}.`;
  console.log(message);
});

// ====================================
// HELPER FUNCTIONS FOR TESTING
// ====================================

/**
 * Test function to simulate different user roles
 */
export const switchUserRole = (role: 'customer' | 'professional') => {
  const userIds = {
    customer: '69680f25fda92b3c5a16e4ca',
    professional: '69680f25fda92b3c5a16e4cb',
  };

  console.log(`🔄 Switching to ${role} mode...`);
  console.log(`Use this user ID in Postman: ${userIds[role]}`);
};

/**
 * Test connection status
 */
export const checkConnection = () => {
  console.log('🔍 Connection Status:');
  console.log('- Connected:', socket.connected);
  console.log('- Socket ID:', socket.id);
  console.log('- User ID:', USER_ID);
};
