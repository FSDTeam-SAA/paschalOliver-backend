import { RequestHistory } from './requestHistory.model';
import { Booking } from '../booking/booking.model';
import { TRequestHistoryStatus } from './requestHistory.constant';

import httpStatus from 'http-status-codes';
import AppError from '../../error/appError';

// Get professional's request history with filtering and pagination
const getRequestHistory = async (
  professionalId: string,
  status?: TRequestHistoryStatus,
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;

  const query: any = { professional: professionalId };

  // If status is provided, filter by status
  if (status) {
    query.status = status;
  }

  const requests = await RequestHistory.find(query)
    .populate({
      path: 'customer',
      select: 'name email phone image',
    })
    .populate({
      path: 'service',
      select: 'title image',
    })
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
  const request = await RequestHistory.findById(requestId)
    .populate({
      path: 'customer',
      select: 'name email phone image role',
    })
    .populate({
      path: 'service',
      select: 'title image',
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
    throw new AppError(httpStatus.NOT_FOUND, 'Request history not found');
  }

  // TODO: Calculate payment details based on professional's hourly rate
  // Example: const hourlyRate = await getProfessionalRate(request.professional);
  // const paymentAmount = (request.booking.durationInMinutes / 60) * hourlyRate;
  const paymentDetails = {
    // amount: paymentAmount,
    // currency: 'USD',
    // calculated: true,
    message: 'Payment calculation pending - hourly rate not implemented',
  };

  // TODO: Calculate distance from professional's location to customer address
  // Example: const professionalLocation = await getProfessionalLocation(professionalId);
  // const distance = calculateDistance(
  //   professionalLocation.coordinates,
  //   request.address.coordinates
  // );
  const distanceInfo = {
    // value: distance,
    // unit: 'km',
    message: 'Distance calculation pending - location integration required',
  };

  // TODO: Calculate estimated time/duration from map provider (Google Maps, Mapbox, etc.)
  // Example: const travelTime = await getMapProviderDuration(
  //   professionalLocation.coordinates,
  //   request.address.coordinates
  // );
  const durationInfo = {
    // walkingTime: travelTime.walking,
    // drivingTime: travelTime.driving,
    message: 'Duration calculation pending - map provider integration required',
  };

  return {
    ...request,
    calculatedFields: {
      payment: paymentDetails,
      distance: distanceInfo,
      travelDuration: durationInfo,
    },
  };
};

// Accept a request
const acceptRequest = async (professionalId: string, requestId: string) => {
  const requestHistory = await RequestHistory.findById(requestId);

  if (!requestHistory) {
    throw new AppError(httpStatus.NOT_FOUND, 'Request history not found');
  }

  // Verify the request is assigned to this professional
  if (requestHistory.professional?.toString() !== professionalId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to accept this request',
    );
  }

  // Validate current status - can only accept if status is 'new'
  if (requestHistory.status !== 'new') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
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
  ]);

  // TODO: Send real-time notification to customer via Socket.IO
  // socket.to(customerId).emit('requestAccepted', { requestId, professionalId });

  return requestHistory;
};

// Reject a request
const rejectRequest = async (professionalId: string, requestId: string) => {
  const requestHistory = await RequestHistory.findById(requestId);

  if (!requestHistory) {
    throw new AppError(httpStatus.NOT_FOUND, 'Request history not found');
  }

  // Verify the request is assigned to this professional
  if (requestHistory.professional?.toString() !== professionalId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to reject this request',
    );
  }

  // Validate current status - can only reject if status is 'new'
  // Cannot reject after accepting
  if (requestHistory.status !== 'new') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot reject request with status: ${requestHistory.status}. Professional cannot reject after accepting.`,
    );
  }

  // Update RequestHistory status
  requestHistory.status = 'cancelled_by_professional';
  await requestHistory.save();

  // Update corresponding Booking status
  const booking = await Booking.findById(requestHistory.booking);
  if (booking) {
    booking.status = 'cancelled';
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

  // TODO: Send real-time notification to customer via Socket.IO
  // socket.to(customerId).emit('requestRejected', { requestId, professionalId });

  return requestHistory;
};

export const RequestHistoryServices = {
  getRequestHistory,
  getRequestHistoryDetails,
  acceptRequest,
  rejectRequest,
};
