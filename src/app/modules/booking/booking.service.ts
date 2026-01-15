import AppError from '../../error/appError';
import { RequestHistory } from '../Requests_history/requestHistory.model';
import { IBooking } from './booking.interface';
import { Booking } from './booking.model';
import httpStatus from 'http-status-codes';

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
  const booking = await Booking.findOne({ _id: bookingId, customer: userId });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  booking.status = 'cancelled_by_client';
  await booking.save();

  const requestHistory = await RequestHistory.findOne({ booking: bookingId });
  if (requestHistory) {
    requestHistory.status = 'cancelled_by_client';
    await requestHistory.save();
  }

  return booking;
};

export const BookingServices = {
  createBooking,
  getAllBookings,
  cancelBooking,
};
