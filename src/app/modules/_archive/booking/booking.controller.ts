import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { BookingServices } from './booking.service';

const createBooking = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await BookingServices.createBooking(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Booking request created successfully',
    data: result,
  });
});

const getAllBookings = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await BookingServices.getAllBookings(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result,
  });
});

const cancelBooking = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { bookingId } = req.params;
  const result = await BookingServices.cancelBooking(
    userId,
    bookingId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Booking cancelled successfully',
    data: result,
  });
});

export const BookingControllers = {
  createBooking,
  getAllBookings,
  cancelBooking,
};
