import { IBooking } from './booking.interface';
import { Booking } from './booking.model';

const createBooking = async (userId: string, payload: IBooking) => {
  const result = await Booking.create({
    ...payload,
    customer: userId,
  });
  return result;
};

const getAllBookings = async (userId: string) => {
  const result = await Booking.find({ customer: userId })
    .populate('service')
    .populate('address')
    .sort({ createdAt: -1 });
  return result;
};

// New function to cancel booking
const cancelBooking = async (userId: string, bookingId: string) => {
  const result = await Booking.findOneAndUpdate(
    { _id: bookingId, customer: userId }, // Ensure user owns the booking
    { status: 'cancelled' },
    { new: true },
  );
  return result;
};

export const BookingServices = {
  createBooking,
  getAllBookings,
  cancelBooking,
};
