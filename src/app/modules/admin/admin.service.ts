import AppError from '../../error/appError';
import { Booking } from '../booking/booking.model';
import { Professional } from '../professional/professional.model';

import { User } from '../user/user.model';

export const dasboardData = async () => {
  const totalUsers = await User.find({ role: 'client' }).countDocuments();
  const totalProfessionals = await User.find({
    role: 'professional',
  }).countDocuments();
  const totalBookings = await Booking.find({}).countDocuments();

  const bookingsByService = await Booking.aggregate([
    {
      $group: {
        _id: '$service',
        totalBookings: { $sum: 1 },
      },
    },

    {
      $lookup: {
        from: 'services', // collection name
        localField: '_id',
        foreignField: '_id',
        as: 'serviceInfo',
      },
    },

    {
      $unwind: '$serviceInfo',
    },

    {
      $project: {
        _id: 0,
        serviceId: '$_id',
        serviceName: '$serviceInfo.title',
        totalBookings: 1,
      },
    },
  ]);
  const getLatestBookingsService = await Booking.aggregate([
    {
      $sort: { createdAt: -1 },
    },
    {
      $limit: 10,
    },

    {
      $lookup: {
        from: 'users',
        localField: 'professional',
        foreignField: '_id',
        as: 'providerInfo',
      },
    },
    {
      $unwind: '$providerInfo',
    },

    {
      $lookup: {
        from: 'users',
        localField: 'customer',
        foreignField: '_id',
        as: 'clientInfo',
      },
    },
    {
      $unwind: '$clientInfo',
    },

    {
      $project: {
        _id: 0,
        providerName: '$providerInfo.name',
        providerPhone: '$providerInfo.phone',
        clientName: '$clientInfo.name',
        clientPhone: '$clientInfo.phone',
        date: '$date',
        amount: '$amount',
        status: '$status',
      },
    },
  ]);
  console.log(getLatestBookingsService);
  return {
    totalUsers: totalUsers,
    totalProfessionals: totalProfessionals,
    totalBookings: totalBookings,
    bookingDistribution: bookingsByService,
    latestBookings: getLatestBookingsService,
  };
};
export const getAllUsersService = async () => {
  const users = await User.find({ role: 'client' });
  return users;
};
export const getAllProfessionalsService = async () => {
  const users = await User.find({ role: 'professional' });
  return users;
};

export const getProfessionalRegistrationRequests = async (
  status?: 'pending' | 'approved' | 'rejected',
) => {
  const matchStage: any = {};

  if (status) {
    matchStage.status = status;
  }

  return await Professional.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        status: 1,
        createdAt: 1,
        identity: 1,
        'user.name': 1,
        'user.email': 1,
        'user.phone': 1,
      },
    },
  ]);
};
export const approveProfessionalService = async (professionalId: string) => {
  const professional = await Professional.findById(professionalId);

  if (!professional) {
    throw new AppError(404, 'Professional not found');
  }

  if (professional.status !== 'pending') {
    throw new AppError(400, 'This request is already processed');
  }

  professional.status = 'approved';
  professional.isVerified = true;

  await professional.save();
  return professional;
};
export const rejectProfessionalService = async (professionalId: string) => {
  const professional = await Professional.findById(professionalId);

  if (!professional) {
    throw new AppError(404, 'Professional not found');
  }

  if (professional.status !== 'pending') {
    throw new AppError(400, 'This request is already processed');
  }

  professional.status = 'rejected';
  professional.isVerified = false;

  await professional.save();
  return professional;
};
