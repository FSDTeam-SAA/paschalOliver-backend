import { Booking } from '../booking/booking.model';

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
