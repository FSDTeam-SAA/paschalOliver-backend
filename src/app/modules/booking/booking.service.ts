import mongoose, { Types } from 'mongoose';
import AppError from '../../error/appError';
import { Listing } from '../listing/listing.model';
import { RequestHistory } from '../Requests_history/requestHistory.model';
import { IBooking } from './booking.interface';
import { Booking } from './booking.model';
import { getIo } from '../../socket/server';
import { NotificationService } from '../notification/notification.service';
import { NOTIFICATION_TYPE } from '../notification/notification.constant';
import { User } from '../user/user.model';
// import httpStatus from 'http-status-codes';

// Create booking
const createBooking = async (userId: string, payload: IBooking) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { service, professional, durationInMinutes } = payload;

    // Find listing
    const listing = await Listing.findOne({
      service: new Types.ObjectId(service),
      professional: new Types.ObjectId(professional),
      isActive: true,
    }).session(session);

    if (!listing) {
      throw new AppError(
        404,
        'No active listing found for this service and professional',
      );
    }

    // Calculate amount
    const durationInHours = durationInMinutes / 60;
    let amount = listing.price * durationInHours;

    if (listing.isDiscountOffered && listing.discountPercentage > 0) {
      const discountAmount = (amount * listing.discountPercentage) / 100;
      amount = amount - discountAmount;
    }

    // Create booking
    const result: any = await Booking.create(
      [
        {
          ...payload,
          customer: userId,
          amount: Math.round(amount),
        },
      ],
      { session },
    );

    if (!result || !result[0]) {
      throw new AppError(404, 'Booking not found');
    }

    const booking = result[0];

    // Populate booking
    const populatedBooking: any = await Booking.findById(booking._id)
      .populate({
        path: 'customer',
        select: 'name email avatar',
      })
      .populate({
        path: 'professional',
        select: 'personalDetails user',
      })
      .populate({
        path: 'service',
        select: 'title type',
      })
      .session(session);

    if (!populatedBooking) {
      throw new AppError(404, 'Booking not found after creation');
    }

    //chseck professional usert is active or not
    if (populatedBooking.professional) {
      const isActive = await User.findOne({
        _id: populatedBooking.professional.user,
        isBlocked: false,
      });


      if (!isActive) {
        throw new AppError(404, 'Professional is not active now');
      }
    }

    // Save notification
    await NotificationService.createNotification({
      // receiver (professional)
      reciverId: populatedBooking.professional.user,
      receiver: {
        id: populatedBooking.professional.user,
        name: populatedBooking.professional.personalDetails.name,
      },

      // sender (customer)
      senderId: populatedBooking.customer._id,
      sender: {
        id: populatedBooking.customer._id,
        name: populatedBooking.customer.name,
      },

      type: NOTIFICATION_TYPE.BOOKING_ACCEPTED,
      title: 'Booking Accepted',

      message: `New booking received: ${populatedBooking.customer.name} booked your "${populatedBooking.service.title}" service on ${new Date(
        populatedBooking.date,
      ).toDateString()}.`,

      referenceId: populatedBooking._id,
      referenceModel: 'Booking',
    });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Emit real-time notification
    getIo()
      .to(populatedBooking.professional.user.toString())
      .emit('newBooking', populatedBooking);

    return populatedBooking;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
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

  //send notification in realtime
  // getIo().to(to).emit('bookingCancelled', booking);
  //! Need to implement this for realtime notification
  return booking;
};

export const BookingServices = {
  createBooking,
  getAllBookings,
  cancelBooking,
};
