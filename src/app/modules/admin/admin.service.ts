import mongoose, { Types } from 'mongoose';
import AppError from '../../error/appError';
import { NotificationService } from '../notification/notification.service';
import { Professional } from '../professional/professional.model';

import { User } from '../user/user.model';
import { NOTIFICATION_TYPE } from '../notification/notification.constant';
import { Booking } from '../_archive/booking/booking.model';
// import { getIo } from '../../socket/server';

export const bookingManagementService = async () => {
  const getLatestBookingsService = await Booking.aggregate([
    // latest booking
    { $sort: { createdAt: -1 } },

    // booking → professional
    {
      $lookup: {
        from: 'professionals',
        localField: 'professional',
        foreignField: '_id',
        as: 'professionalInfo',
      },
    },
    { $unwind: '$professionalInfo' },

    // professional → user
    {
      $lookup: {
        from: 'users',
        localField: 'professionalInfo.user',
        foreignField: '_id',
        as: 'professionalUser',
      },
    },
    { $unwind: '$professionalUser' },

    // booking → customer(user)
    {
      $lookup: {
        from: 'users',
        localField: 'customer',
        foreignField: '_id',
        as: 'clientInfo',
      },
    },
    { $unwind: '$clientInfo' },

    // service lookup
    {
      $lookup: {
        from: 'services',
        localField: 'service',
        foreignField: '_id',
        as: 'serviceInfo',
      },
    },
    { $unwind: '$serviceInfo' },

    // final shape
    {
      $project: {
        _id: 0,

        professionalName: '$professionalUser.name',
        professionalPhone: '$professionalUser.phone',
        professionalImage: '$professionalUser.image',

        clientName: '$clientInfo.name',
        clientPhone: '$clientInfo.phone',
        clientImage: '$clientInfo.image',
        service: '$serviceInfo.title',
        date: 1,
        amount: 1,
        status: 1,
      },
    },
  ]);

  return getLatestBookingsService;
};
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
  const getBookings: object[] = await bookingManagementService();
  // keep 10 data of the array
  const latestBookings = getBookings.slice(0, 10);

  console.log(getBookings);
  return {
    totalUsers: totalUsers,
    totalProfessionals: totalProfessionals,
    totalBookings: totalBookings,
    bookingDistribution: bookingsByService,
    latestBookings: latestBookings,
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

export const blockUserService = async (userId: string, adminId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1️⃣ Atomically block user (only if not already blocked)
    const user = await User.findOneAndUpdate(
      { _id: userId, isBlocked: false },
      { $set: { isBlocked: true } },
      { new: true, session },
    );

    if (!user) {
      throw new AppError(404, 'User not found or already blocked');
    }

    // 2️⃣ Create notification (inside transaction)
    await NotificationService.createNotification(
      {
        reciverId: user._id,
        receiver: {
          id: user._id,
          name: user.name,
        },
        senderId: new Types.ObjectId(adminId),
        sender: {
          id: new Types.ObjectId(adminId),
          name: 'Admin',
        },
        type: NOTIFICATION_TYPE.BLOCK_USER,
        title: 'User blocked',
        message: 'Your account has been blocked by admin',
      },
      session, // 🔥 important
    );

    // 3️⃣ Commit transaction
    await session.commitTransaction();

    // 4️⃣ Emit socket event AFTER commit
    // setImmediate(() => {
    //   getIo().to(user._id.toString()).emit('userBlocked', {
    //     type: NOTIFICATION_TYPE.BLOCK_USER,
    //   });
    // });

    return user;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const unblockUserService = async (userId: string, adminId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const user = await User.findOneAndUpdate(
      { _id: userId, isBlocked: true },
      { $set: { isBlocked: false } },
      { new: true, session },
    );

    if (!user) {
      throw new AppError(404, 'User not found or already active');
    }

    await NotificationService.createNotification(
      {
        reciverId: user._id,
        receiver: {
          id: user._id,
          name: user.name,
        },
        senderId: new Types.ObjectId(adminId),
        sender: {
          id: new Types.ObjectId(adminId),
          name: 'Admin',
        },
        type: NOTIFICATION_TYPE.UNBLOCK_USER,
        title: 'User unblocked',
        message: 'Your account has been unblocked by admin',
      },
      session,
    );

    await session.commitTransaction();

    // setImmediate(() => {
    //   getIo().to(user._id.toString()).emit('userUnblocked', {
    //     type: NOTIFICATION_TYPE.UNBLOCK_USER,
    //   });
    //   console.log('unblock notification sent successfully');
    // });

    return user;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
