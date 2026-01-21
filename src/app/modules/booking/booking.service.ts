import { Types } from 'mongoose';
import AppError from '../../error/appError';
import { Listing } from '../listing/listing.model';
import { RequestHistory } from '../Requests_history/requestHistory.model';
import { IBooking } from './booking.interface';
import { Booking } from './booking.model';
// import httpStatus from 'http-status-codes';

const createBooking = async (userId: string, payload: IBooking) => {
  const { service, professional, durationInMinutes } = payload;

  const listing = await Listing.findOne({
    service: new Types.ObjectId(service),
    professional: new Types.ObjectId(professional),
    isActive: true,
  });

  if (!listing) {
    throw new AppError(
      404,
      'No active listing found for this service and professional',
    );
  }

  const durationInHours = durationInMinutes / 60;

  let amount = listing.price * durationInHours;

  if (listing.isDiscountOffered && listing.discountPercentage > 0) {
    const discountAmount = (amount * listing.discountPercentage) / 100;
    amount = amount - discountAmount;
  }

  const result = await Booking.create({
    ...payload,
    customer: userId,
    amount: Math.round(amount), // optional: round for clean number
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
    throw new AppError(404, 'Booking not found');
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
