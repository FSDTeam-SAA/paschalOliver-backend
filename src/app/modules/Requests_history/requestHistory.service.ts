import { RequestHistory } from './requestHistory.model';
import { Booking } from '../booking/booking.model';
import { requestHistoryStatus } from './requestHistory.constant';

import AppError from '../../error/appError';
import { Listing } from '../listing/listing.model';
import { Professional } from '../professional/professional.model';
import { NotificationService } from '../notification/notification.service';
import { NOTIFICATION_TYPE } from '../notification/notification.constant';
import { getIo } from '../../socket/server';
import mongoose from 'mongoose';

// Get professional's request history with filtering and pagination
const getRequestHistory = async (
  userId: string,
  status?: string,
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;
  const professional: any = await Professional.findOne({ user: userId });
  if (!professional) {
    throw new AppError(404, 'Professional not found');
  }

  const query: any = { professional: professional._id };

  if (status) {
    if (status === 'cancelled') {
      query.status = {
        $in: [
          requestHistoryStatus.cancelled_by_client,
          requestHistoryStatus.cancelled_by_professional,
        ],
      };
    } else {
      query.status = status;
    }
  }

  const requests = await RequestHistory.find(query)
    .populate({ path: 'customer', select: 'name email phone image' })
    .populate({ path: 'service', select: 'title image' })
    .populate({
      path: 'address',
      select: 'address streetNumber addressDetails coordinates',
    })
    .populate({
      path: 'booking',
      select: 'date startTime durationInMinutes scheduleType',
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await RequestHistory.countDocuments(query);

  return {
    requests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get single request history details with calculated fields
const getRequestHistoryDetails = async (requestId: string) => {
  //
  console.log(requestId);
  const request = await RequestHistory.findById(requestId)
    .populate({
      path: 'service',
      select: 'title image',
    })
    .populate({
      path: 'customer',
      select: 'name email phone image role',
    })

    .populate({
      path: 'address',
      select: 'address streetNumber addressDetails coordinates',
    })
    .populate({
      path: 'booking',
      select: 'date startTime durationInMinutes scheduleType',
    })
    .populate({
      path: 'professional',
      select: 'name email phone image',
    })
    .lean();

  if (!request) {
    throw new AppError(404, 'Request history not found');
  }
  console.log('piorg', request);

  // const hourlyRate = await getProfessionalRate(request.professional);
  const listing = await Listing.findOne({
    professional: request.professional?._id,
    service: request.service?._id,
  });
  const booking = request.booking as any;
  const hourlyRate = listing?.price;

  const paymentAmount = Number(
    ((booking.durationInMinutes / 60) * hourlyRate!).toFixed(2),
  );

  const paymentDetails = {
    amount: paymentAmount,
    currency: 'USD',
    calculated: true,
  };

  return {
    ...request,
    calculatedFields: {
      payment: paymentDetails,
    },
  };
};

const acceptRequest = async (userId: string, requestId: string) => {
  // ✅ STEP 1: Parallel queries (no transaction needed for reads)
  const [requestHistory, professional]: [any, any] = await Promise.all([
    RequestHistory.findById(requestId).populate([
      {
        path: 'customer',
        select: 'name email phone image',
      },
      {
        path: 'service',
        select: 'title image',
      },
      {
        path: 'address',
        select: 'address streetNumber addressDetails coordinates',
      },
      {
        path: 'booking',
        select: 'date startTime durationInMinutes scheduleType',
      },
      {
        path: 'professional',
        select: '_id user personalDetails',
      },
    ]),
    Professional.findOne({ user: userId }).lean(),
  ]);

  if (!requestHistory) {
    throw new AppError(404, 'Request history not found');
  }
  if (!professional) {
    throw new AppError(404, 'Professional not found');
  }

  // Verify authorization
  if (
    requestHistory.professional?._id?.toString() !==
    professional._id?.toString()
  ) {
    throw new AppError(403, 'You are not authorized to accept this request');
  }

  // Validate status
  if (requestHistory.status !== 'new') {
    throw new AppError(
      400,
      `Cannot accept request with status: ${requestHistory.status}`,
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedRequestHistory: any = await RequestHistory.findByIdAndUpdate(
      requestId,
      { status: 'accepted' },
      { session, new: true },
    ).populate([
      {
        path: 'customer',
        select: 'name email phone image',
      },
      {
        path: 'service',
        select: 'title image',
      },
      {
        path: 'address',
        select: 'address streetNumber addressDetails coordinates',
      },
      {
        path: 'booking',
        select: 'date startTime durationInMinutes scheduleType',
      },
      {
        path: 'professional',
        select: '_id user personalDetails',
      },
    ]);

    if (requestHistory.booking?._id) {
      await Booking.findByIdAndUpdate(
        requestHistory.booking._id,
        { status: 'accepted' },
        { session, new: true },
      );
    }

    await NotificationService.createNotification({
      reciverId: updatedRequestHistory.customer._id,
      receiver: {
        id: updatedRequestHistory.customer._id,
        name: updatedRequestHistory.customer.name,
      },
      senderId: updatedRequestHistory.professional.user,
      sender: {
        id: updatedRequestHistory.professional.user,
        name: updatedRequestHistory.professional.personalDetails.name,
      },
      type: NOTIFICATION_TYPE.BOOKING_ACCEPTED,
      title: 'Booking Accepted',
      message: `${updatedRequestHistory.professional.personalDetails.name} accepted your ${updatedRequestHistory.service.title} service on ${updatedRequestHistory.booking.date}.`,
      referenceId: updatedRequestHistory.booking._id,
      referenceModel: 'Booking',
    });
    setImmediate(async () => {
      try {
        // Send real-time socket event
        const socketPayload = {
          type: 'BOOKING_ACCEPTED',
          requestId: updatedRequestHistory._id,
          bookingId: updatedRequestHistory.booking._id,
          professional: {
            id: updatedRequestHistory.professional._id,
            name: updatedRequestHistory.professional.personalDetails.name,
          },
          service: {
            id: updatedRequestHistory.service._id,
            title: updatedRequestHistory.service.title,
          },
          booking: {
            date: updatedRequestHistory.booking.date,
            startTime: updatedRequestHistory.booking.startTime,
            duration: updatedRequestHistory.booking.durationInMinutes,
          },
          status: 'accepted',
          timestamp: new Date().toISOString(),
        };

        getIo()
          .to(updatedRequestHistory.customer._id.toString())
          .emit('bookingAccepted', socketPayload);

        console.log('✅ Notification and socket event sent successfully');
      } catch (error) {
        console.error('❌ Error sending notification/socket event:', error);
      }
    });
    await session.commitTransaction();
    console.log('✅ Transaction committed successfully');
    return updatedRequestHistory || requestHistory;
  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Transaction aborted:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

// Reject a request
const rejectRequest = async (userId: string, requestId: string) => {
  const [requestHistory, professional] = await Promise.all([
    RequestHistory.findById(requestId).populate([
      {
        path: 'customer',
        select: 'name email phone image',
      },
      {
        path: 'service',
        select: 'title image',
      },
      {
        path: 'address',
        select: 'address streetNumber addressDetails coordinates',
      },
      {
        path: 'booking',
        select: 'date startTime durationInMinutes scheduleType',
      },
      {
        path: 'professional',
        select: '_id user personalDetails',
      },
    ]),
    Professional.findOne({ user: userId }).lean(),
  ]);

  if (!requestHistory) {
    throw new AppError(404, 'Request history not found');
  }

  if (!professional) {
    throw new AppError(404, 'Professional not found');
  }

  // Verify authorization
  if (
    requestHistory.professional?._id?.toString() !==
    professional._id?.toString()
  ) {
    throw new AppError(403, 'You are not authorized to reject this request');
  }

  // Validate status - can only reject if status is 'new'
  if (requestHistory.status !== 'new') {
    throw new AppError(
      400,
      `Cannot reject request with status: ${requestHistory.status}. Professional cannot reject after accepting.`,
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedRequestHistory: any = await RequestHistory.findByIdAndUpdate(
      requestId,
      { status: 'cancelled_by_professional' },
      { session, new: true },
    ).populate([
      {
        path: 'customer',
        select: 'name email phone image',
      },
      {
        path: 'service',
        select: 'title image',
      },
      {
        path: 'address',
        select: 'address streetNumber addressDetails coordinates',
      },
      {
        path: 'booking',
        select: 'date startTime durationInMinutes scheduleType',
      },
      {
        path: 'professional',
        select: '_id user personalDetails',
      },
    ]);

    // Update corresponding Booking status
    if (requestHistory.booking?._id) {
      await Booking.findByIdAndUpdate(
        requestHistory.booking._id,
        { status: 'cancelled_by_professional' },
        { session, new: true },
      );
    }
    // Create notification in database
    await NotificationService.createNotification({
      // Receiver (customer)
      reciverId: updatedRequestHistory.customer._id,
      receiver: {
        id: updatedRequestHistory.customer._id,
        name: updatedRequestHistory.customer.name,
      },
      // Sender (professional)
      senderId: updatedRequestHistory.professional.user,
      sender: {
        id: updatedRequestHistory.professional.user,
        name: updatedRequestHistory.professional.personalDetails.name,
      },
      type: NOTIFICATION_TYPE.BOOKING_CANCELLED,
      title: 'Booking Rejected',
      message: `${updatedRequestHistory.professional.personalDetails.name} rejected your booking request for "${updatedRequestHistory.service.title}" on ${updatedRequestHistory.booking.date}.`,
      referenceId: updatedRequestHistory.booking._id,
      referenceModel: 'Booking',
    });
    await session.commitTransaction();
    console.log('✅ Rejection transaction committed successfully');

    setImmediate(async () => {
      try {
        // Send real-time socket event to customer
        const socketPayload = {
          type: 'BOOKING_REJECTED',
          requestId: updatedRequestHistory._id,
          bookingId: updatedRequestHistory.booking._id,
          professional: {
            id: updatedRequestHistory.professional._id,
            name: updatedRequestHistory.professional.personalDetails.name,
          },
          service: {
            id: updatedRequestHistory.service._id,
            title: updatedRequestHistory.service.title,
          },
          booking: {
            date: updatedRequestHistory.booking.date,
            startTime: updatedRequestHistory.booking.startTime,
            duration: updatedRequestHistory.booking.durationInMinutes,
          },
          status: 'cancelled_by_professional',
          timestamp: new Date().toISOString(),
        };

        getIo()
          .to(updatedRequestHistory.customer._id.toString())
          .emit('bookingRejected', socketPayload);

        console.log('✅ Rejection notification sent successfully');
      } catch (error) {
        console.error('❌ Error sending rejection notification:', error);
      }
    });

    return updatedRequestHistory || requestHistory;
  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Rejection transaction aborted:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

const completeRequest = async (requestId: string) => {
  const requestHistory: any = await RequestHistory.findById(requestId).populate(
    [
      {
        path: 'customer',
        select: 'name email phone image',
      },
      {
        path: 'service',
        select: 'title image',
      },
      {
        path: 'address',
        select: 'address streetNumber addressDetails coordinates',
      },
      {
        path: 'booking',
        select: 'date startTime durationInMinutes scheduleType amount',
      },
      {
        path: 'professional',
        select: '_id user personalDetails',
      },
    ],
  );

  if (!requestHistory) {
    throw new AppError(404, 'Request history not found');
  }

  if (!requestHistory.booking) {
    throw new AppError(404, 'Booking not found');
  }

  // Validate status - can only complete if accepted
  if (requestHistory.status !== 'accepted') {
    const errorMessage =
      requestHistory.status === 'new'
        ? 'Before completing, you have to accept the request first'
        : `You cannot complete this request with status: ${requestHistory.status}`;
    throw new AppError(400, errorMessage);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 🔒 CRITICAL: Update both documents in transaction
    const updatedRequestHistory: any = await RequestHistory.findByIdAndUpdate(
      requestId,
      { status: 'completed' },
      { session, new: true },
    ).populate([
      {
        path: 'customer',
        select: 'name email phone image',
      },
      {
        path: 'service',
        select: 'title image',
      },
      {
        path: 'address',
        select: 'address streetNumber addressDetails coordinates',
      },
      {
        path: 'booking',
        select: 'date startTime durationInMinutes scheduleType amount',
      },
      {
        path: 'professional',
        select: '_id user personalDetails',
      },
    ]);

    // Update corresponding Booking status
    await Booking.findByIdAndUpdate(
      requestHistory.booking._id,
      { status: 'completed' },
      { session, new: true },
    );

    await NotificationService.createNotification({
      // Receiver (customer)
      reciverId: updatedRequestHistory.customer._id,
      receiver: {
        id: updatedRequestHistory.customer._id,
        name: updatedRequestHistory.customer.name,
      },
      // Sender (professional)
      senderId: updatedRequestHistory.professional.user,
      sender: {
        id: updatedRequestHistory.professional.user,
        name: updatedRequestHistory.professional.personalDetails.name,
      },
      type: NOTIFICATION_TYPE.BOOKING_COMPLETED,
      title: 'Service Completed',
      message: `${updatedRequestHistory.professional.personalDetails.name} completed your "${updatedRequestHistory.service.title}" service. Please review the service!`,
      referenceId: updatedRequestHistory.booking._id,
      referenceModel: 'Booking',
    });
    await session.commitTransaction();
    console.log('✅ Completion transaction committed successfully');

    setImmediate(async () => {
      try {
        const customerSocketPayload = {
          type: 'BOOKING_COMPLETED',
          requestId: updatedRequestHistory._id,
          bookingId: updatedRequestHistory.booking._id,
          professional: {
            id: updatedRequestHistory.professional._id,
            name: updatedRequestHistory.professional.personalDetails.name,
          },
          service: {
            id: updatedRequestHistory.service._id,
            title: updatedRequestHistory.service.title,
          },
          booking: {
            date: updatedRequestHistory.booking.date,
            startTime: updatedRequestHistory.booking.startTime,
            duration: updatedRequestHistory.booking.durationInMinutes,
            amount: updatedRequestHistory.booking.amount,
          },
          status: 'completed',
          message: 'Please review the service!',
          timestamp: new Date().toISOString(),
        };

        getIo()
          .to(updatedRequestHistory.customer._id.toString())
          .emit('bookingCompleted', customerSocketPayload);

        console.log(
          '✅ Completion notifications sent to customer successfully',
        );
      } catch (error) {
        console.error('❌ Error sending completion notification:', error);
      }
    });

    return updatedRequestHistory || requestHistory;
  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Completion transaction aborted:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

export default completeRequest;

export const RequestHistoryServices = {
  getRequestHistory,
  getRequestHistoryDetails,
  acceptRequest,
  rejectRequest,
  completeRequest,
};
