import { RequestHistory } from './requestHistory.model';
import { Booking } from '../booking/booking.model';
import { requestHistoryStatus } from './requestHistory.constant';

import AppError from '../../error/appError';
import { Listing } from '../listing/listing.model';
import { Professional } from '../professional/professional.model';
import { NotificationService } from '../notification/notification.service';
import { NOTIFICATION_TYPE } from '../notification/notification.constant';
import { getIo } from '../../socket/server';

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

// Accept a request

const acceptRequest = async (userId: any, requestId: any) => {
  const requestHistory: any = await RequestHistory.findById(requestId);
  const professional = await Professional.findOne({ user: userId });

  if (!professional) {
    throw new AppError(404, 'Professional not found');
  }

  if (!requestHistory) {
    throw new AppError(404, 'Request history not found');
  }

  // Verify the request is assigned to this professional
  if (
    requestHistory.professional?.toString() !== professional._id?.toString()
  ) {
    throw new AppError(403, 'You are not authorized to accept this request');
  }

  // Validate current status - can only accept if status is 'new'
  if (requestHistory.status !== 'new') {
    throw new AppError(
      400,
      `Cannot accept request with status: ${requestHistory.status}`,
    );
  }

  // Update RequestHistory status
  requestHistory.status = 'accepted';
  await requestHistory.save();

  // Update corresponding Booking status
  const booking = await Booking.findById(requestHistory.booking);
  if (booking) {
    booking.status = 'accepted';
    await booking.save();
  }

  // Populate the updated request
  await requestHistory.populate([
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

  console.log(requestHistory);

  // Create notification
  await NotificationService.createNotification({
    reciverId: requestHistory.customer._id,
    receiver: {
      id: requestHistory.customer._id,
      name: requestHistory.customer.name,
    },
    senderId: requestHistory.professional.user,
    sender: {
      id: requestHistory.professional.user,
      name: requestHistory.professional.personalDetails.name,
    },
    type: NOTIFICATION_TYPE.BOOKING_ACCEPTED,
    title: 'Booking Accepted',
    message: `New booking accepted: ${requestHistory.professional.personalDetails.name} accept your ${requestHistory.service.title} service on ${requestHistory.booking.date}.`,
    referenceId: requestHistory.booking._id,
    referenceModel: 'Booking',
  });

  // Emit socket event
  getIo()
    .to(requestHistory.customer._id.toString())
    .emit('acceptRequest', { hello: 'hello' });
  return requestHistory;
};

// Reject a request
const rejectRequest = async (userId: string, requestId: string) => {
  const requestHistory = await RequestHistory.findById(requestId);

  if (!requestHistory) {
    throw new AppError(404, 'Request history not found');
  }

  const professional: any = await Professional.findOne({ user: userId });
  if (!professional) {
    throw new AppError(404, 'Professional not found');
  }

  // Verify the request is assigned to this professional
  if (
    requestHistory.professional?.toString() !== professional._id?.toString()
  ) {
    throw new AppError(403, 'You are not authorized to reject this request');
  }

  // Validate current status - can only reject if status is 'new'
  // Cannot reject after accepting
  if (requestHistory.status !== 'new') {
    throw new AppError(
      400,
      `Cannot reject request with status: ${requestHistory.status}. Professional cannot reject after accepting.`,
    );
  }

  // Update RequestHistory status
  requestHistory.status = 'cancelled_by_professional';
  await requestHistory.save();

  // Update corresponding Booking status
  const booking = await Booking.findById(requestHistory.booking);
  if (booking) {
    booking.status = 'cancelled_by_professional';
    await booking.save();
  }

  // Populate the updated request
  await requestHistory.populate([
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
  ]);

  return requestHistory;
};

export const RequestHistoryServices = {
  getRequestHistory,
  getRequestHistoryDetails,
  acceptRequest,
  rejectRequest,
};
