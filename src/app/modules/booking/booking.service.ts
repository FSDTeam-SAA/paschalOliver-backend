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
/**
 * ✅ OPTIMIZED: Create booking with transaction
 *
 * Improvements:
 * - Notification moved OUTSIDE transaction (fire-and-forget)
 * - Better error handling
 * - Faster response time
 */
const createBooking = async (userId: string, payload: IBooking) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { service, professional, durationInMinutes } = payload;

    // Check if user has 2 pending bookings
    const previousBookings = await Booking.find({
      customer: userId,
      status: 'pending',
    }).session(session);

    if (previousBookings.length >= 2) {
      throw new AppError(
        400,
        'You already have 2 pending bookings. Please complete or cancel existing bookings first.',
      );
    }

    // Find active listing
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

    // Calculate amount with discount
    const durationInHours = durationInMinutes / 60;
    let amount = listing.price * durationInHours;

    if (listing.isDiscountOffered && listing.discountPercentage > 0) {
      const discountAmount = (amount * listing.discountPercentage) / 100;
      amount = amount - discountAmount;
    }

    // Create booking
    const result = await Booking.create(
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
      throw new AppError(500, 'Failed to create booking');
    }

    const booking = result[0];

    // Populate booking details
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
      throw new AppError(500, 'Booking not found after creation');
    }

    // Check if professional is active
    if (populatedBooking.professional) {
      const isActive = await User.findOne({
        _id: populatedBooking.professional.user,
        isBlocked: false,
      }).session(session);

      if (!isActive) {
        throw new AppError(
          400,
          'Professional is not active or has been blocked',
        );
      }
    }

    // ✅ Commit transaction BEFORE notifications
    await session.commitTransaction();
    console.log('✅ Booking created successfully');

    // ✅ Fire-and-forget: Send notifications AFTER transaction
    setImmediate(async () => {
      try {
        // Type guard for required fields
        if (
          !populatedBooking?.professional?.user ||
          !populatedBooking?.professional?.personalDetails?.name ||
          !populatedBooking?.customer?._id ||
          !populatedBooking?.customer?.name ||
          !populatedBooking?.service?.title ||
          !populatedBooking?._id ||
          !populatedBooking?.date
        ) {
          console.error('❌ Missing required fields for notification');
          return;
        }

        // Create notification in database
        await NotificationService.createNotification({
          // Receiver (professional)
          reciverId: populatedBooking.professional.user,
          receiver: {
            id: populatedBooking.professional.user,
            name: populatedBooking.professional.personalDetails.name,
          },
          // Sender (customer)
          senderId: populatedBooking.customer._id,
          sender: {
            id: populatedBooking.customer._id,
            name: populatedBooking.customer.name,
          },
          type: NOTIFICATION_TYPE.BOOKING_CREATED,
          title: 'New Booking Request',
          message: `${populatedBooking.customer.name} booked your "${populatedBooking.service.title}" service on ${new Date(populatedBooking.date).toDateString()}.`,
          referenceId: populatedBooking._id,
          referenceModel: 'Booking',
        });

        // Send real-time socket event to professional
        const socketPayload = {
          type: 'NEW_BOOKING',
          bookingId: populatedBooking._id,
          customer: {
            id: populatedBooking.customer._id,
            name: populatedBooking.customer.name,
            avatar: populatedBooking.customer.avatar,
          },
          service: {
            id: populatedBooking.service._id,
            title: populatedBooking.service.title,
            type: populatedBooking.service.type,
          },
          booking: {
            date: populatedBooking.date,
            startTime: populatedBooking.startTime,
            duration: populatedBooking.durationInMinutes,
            amount: populatedBooking.amount,
          },
          status: populatedBooking.status,
          timestamp: new Date().toISOString(),
        };

        getIo()
          .to(populatedBooking.professional.user.toString())
          .emit('newBooking', socketPayload);

        console.log('✅ Booking notification sent successfully');
      } catch (error) {
        console.error('❌ Error sending booking notification:', error);
        // TODO: Add to retry queue
      }
    });

    return populatedBooking;
  } catch (error) {
    // ❌ Rollback transaction on error
    await session.abortTransaction();
    console.error('❌ Booking creation failed:', error);
    throw error;
  } finally {
    // 🧹 Always cleanup session
    session.endSession();
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
/**
 * ✅ OPTIMIZED: Cancel booking by client
 * - Transaction for data consistency
 * - Fire-and-forget notifications
 * - Sends notification to professional
 */
const cancelBooking = async (userId: string, bookingId: string) => {
  // ✅ STEP 1: Fetch and validate booking
  const booking: any = await Booking.findOne({
    _id: bookingId,
    customer: userId,
  })
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
    });

  if (!booking) {
    throw new AppError(
      404,
      'Booking not found or you are not authorized to cancel this booking',
    );
  }

  // Check if booking can be cancelled
  if (
    booking.status === 'cancelled_by_client' ||
    booking.status === 'cancelled_by_professional'
  ) {
    throw new AppError(400, 'This booking is already cancelled');
  }

  if (booking.status === 'completed') {
    throw new AppError(400, 'Cannot cancel a completed booking');
  }

  // ✅ STEP 2: Start transaction for critical updates
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 🔒 CRITICAL: Update both Booking and RequestHistory
    const updatedBooking: any = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'cancelled_by_client' },
      { session, new: true },
    )
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
      });

    // Update corresponding RequestHistory if exists
    const requestHistory = await RequestHistory.findOne({
      booking: bookingId,
    }).session(session);

    if (requestHistory) {
      await RequestHistory.findByIdAndUpdate(
        requestHistory._id,
        { status: 'cancelled_by_client' },
        { session, new: true },
      );
    }

    // ✅ Commit transaction
    await session.commitTransaction();
    console.log('✅ Booking cancellation transaction committed');

    // ✅ STEP 3: Fire-and-forget notifications (outside transaction)
    setImmediate(async () => {
      try {
        // Type guard for required fields
        if (
          !updatedBooking?.professional?.user ||
          !updatedBooking?.professional?.personalDetails?.name ||
          !updatedBooking?.customer?._id ||
          !updatedBooking?.customer?.name ||
          !updatedBooking?.service?.title ||
          !updatedBooking?._id ||
          !updatedBooking?.date
        ) {
          console.error(
            '❌ Missing required fields for cancellation notification',
          );
          return;
        }

        // Create notification in database
        await NotificationService.createNotification({
          // Receiver (professional)
          reciverId: updatedBooking.professional.user,
          receiver: {
            id: updatedBooking.professional.user,
            name: updatedBooking.professional.personalDetails.name,
          },
          // Sender (customer)
          senderId: updatedBooking.customer._id,
          sender: {
            id: updatedBooking.customer._id,
            name: updatedBooking.customer.name,
          },
          type: NOTIFICATION_TYPE.BOOKING_CANCELLED,
          title: 'Booking Cancelled',
          message: `${updatedBooking.customer.name} cancelled their booking for "${updatedBooking.service.title}" on ${new Date(updatedBooking.date).toDateString()}.`,
          referenceId: updatedBooking._id,
          referenceModel: 'Booking',
        });

        // Send real-time socket event to professional
        const socketPayload = {
          type: 'BOOKING_CANCELLED',
          bookingId: updatedBooking._id,
          customer: {
            id: updatedBooking.customer._id,
            name: updatedBooking.customer.name,
            avatar: updatedBooking.customer.avatar,
          },
          service: {
            id: updatedBooking.service._id,
            title: updatedBooking.service.title,
            type: updatedBooking.service.type,
          },
          booking: {
            date: updatedBooking.date,
            startTime: updatedBooking.startTime,
            duration: updatedBooking.durationInMinutes,
            amount: updatedBooking.amount,
          },
          cancelledBy: 'client',
          status: 'cancelled_by_client',
          timestamp: new Date().toISOString(),
        };

        console.log('updatedBooking', updatedBooking);
        getIo()
          .to(updatedBooking.professional.user.toString())
          .emit('bookingCancelled', socketPayload);

        console.log('✅ Cancellation notification sent successfully');
      } catch (error) {
        console.error('❌ Error sending cancellation notification:', error);
        // TODO: Add to retry queue
      }
    });

    return updatedBooking || booking;
  } catch (error) {
    // ❌ Rollback on error
    await session.abortTransaction();
    console.error('❌ Booking cancellation transaction aborted:', error);
    throw error;
  } finally {
    // 🧹 Cleanup
    session.endSession();
  }
};

export const BookingServices = {
  createBooking,
  getAllBookings,
  cancelBooking,
};
