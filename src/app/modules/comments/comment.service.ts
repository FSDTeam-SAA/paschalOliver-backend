import { Comment } from './comment.model';
import AppError from '../../error/appError';
import { Professional } from '../professional/professional.model';
import mongoose from 'mongoose';
import { NotificationService } from '../notification/notification.service';
import { NOTIFICATION_TYPE } from '../notification/notification.constant';
import { Booking } from '../_archive/booking/booking.model';
// import { getIo } from '../../socket/server';

interface ICreateCommentPayload {
  comment?: string;
  review: {
    service: number;
    communication: number;
    kindness: number;
    comfort: number;
  };
}

export const createComment = async (
  userId: string,
  professionalId: string,
  bookingId: string,
  payload: ICreateCommentPayload,
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Verify booking exists and belongs to user
    const booking: any = await Booking.findOne({
      _id: bookingId,
      customer: userId,
      status: 'completed',
    }).session(session);

    if (!booking) {
      throw new AppError(
        403,
        'You can only comment on a completed booking that belongs to you',
      );
    }

    // Check professional exists
    const professional =
      await Professional.findById(professionalId).session(session);

    if (!professional) {
      throw new AppError(404, 'Professional not found');
    }

    // Prevent duplicate comment per booking
    const existingComment = await Comment.findOne({
      bookingId,
      isDeleted: false,
    }).session(session);

    if (existingComment) {
      throw new AppError(400, 'A comment for this booking already exists');
    }

    // Create comment
    const [comment] = await Comment.create(
      [
        {
          userId,
          professionalId,
          bookingId,
          bookedTime: booking.date, // save booking date
          serviceId: booking.service, // optional: store service reference
          ...payload,
        },
      ],
      { session },
    );

    // Push comment ID to professional (type-safe)
    professional.comments.push((comment as any)._id);
    await professional.save({ session });

    // Update professional average rating
    const ratingAggregation = await Comment.aggregate([
      { $match: { professionalId: professional._id, isDeleted: false } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]).session(session);

    professional.averageRating = ratingAggregation[0]?.avgRating || 0;
    await professional.save({ session });

    //populate comment
    const populatedComment: any = await Comment.findById((comment as any)._id)
      .populate('userId', '_id name email')
      .populate('serviceId', 'title serviceType')
      .populate('professionalId', 'personalDetails user')
      .populate('bookingId', 'status durationInMinutes scheduleType')
      .session(session);

    //sent notification when comment is added
    await NotificationService.createNotification({
      // Receiver (professional user)
      reciverId: populatedComment.professionalId.user,
      receiver: {
        id: populatedComment.professionalId.user,
        name: populatedComment.professionalId.personalDetails.name,
      },

      // Sender (customer)
      senderId: populatedComment.userId._id,
      sender: {
        id: populatedComment.userId._id,
        name: populatedComment.userId.name,
      },

      type: NOTIFICATION_TYPE.COMMENT_CREATED,
      title: 'New Comment on Your Service',

      message: `${populatedComment.userId.name} left a review on your "${populatedComment.serviceId.title}" service.`,

      referenceId: populatedComment.serviceId._id,
      referenceModel: 'Service',
    });
    //sent realtime notification via socket
    // getIo()
    //   .to(populatedComment.professionalId.user.toString())
    //   .emit('newComment', populatedComment);

    await session.commitTransaction();
    session.endSession();

    return comment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllComments = async (serviceId: string) => {
  const comments = await Comment.find({ serviceId, isDeleted: false })
    .populate('userId', 'name email')
    .populate('serviceId', 'title serviceType')
    .populate('bookingId', 'status durationInMinutes scheduleType')
    .populate({
      path: 'professionalId',
      select:
        'personalDetails.name personalDetails.gender personalDetails.countryOfBirth',
    })
    .sort({ createdAt: -1 });

  if (comments.length === 0) {
    throw new AppError(404, 'No comments found for this service');
  }
  return comments;
};

// const getAllComments = async (serviceId: string) => {
//   const comments = await Comment.aggregate([
//     // Match service & non-deleted comments
//     {
//       $match: {
//         serviceId: new mongoose.Types.ObjectId(serviceId),
//         isDeleted: false,
//       },
//     },

//     // User lookup
//     {
//       $lookup: {
//         from: 'users',
//         localField: 'userId',
//         foreignField: '_id',
//         as: 'user',
//       },
//     },
//     { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

//     // Service lookup
//     {
//       $lookup: {
//         from: 'services',
//         localField: 'serviceId',
//         foreignField: '_id',
//         as: 'service',
//       },
//     },
//     { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },

//     // Booking lookup
//     {
//       $lookup: {
//         from: 'bookings',
//         localField: 'bookingId',
//         foreignField: '_id',
//         as: 'booking',
//       },
//     },
//     { $unwind: { path: '$booking', preserveNullAndEmptyArrays: true } },

//     // Professional lookup
//     {
//       $lookup: {
//         from: 'professionals',
//         localField: 'professionalId',
//         foreignField: '_id',
//         as: 'professional',
//       },
//     },
//     { $unwind: { path: '$professional', preserveNullAndEmptyArrays: true } },

//     // Shape final response (FLATTEN HERE)
//     {
//       $project: {
//         comment: 1,
//         rating: 1,
//         createdAt: 1,

//         user: {
//           _id: '$user._id',
//           name: '$user.name',
//           email: '$user.email',
//         },

//         service: {
//           _id: '$service._id',
//           title: '$service.title',
//           serviceType: '$service.serviceType',
//         },

//         booking: {
//           _id: '$booking._id',
//           status: '$booking.status',
//           durationInMinutes: '$booking.durationInMinutes',
//           scheduleType: '$booking.scheduleType',
//         },

//         professional: {
//           _id: '$professional._id',
//           name: '$professional.personalDetails.name',
//           gender: '$professional.personalDetails.gender',
//           country: '$professional.personalDetails.countryOfBirth',
//         },
//       },
//     },
//     {
//       $sort: { createdAt: -1 },
//     },
//   ]);

//   if (comments.length === 0) {
//     throw new AppError(404, 'No comments found for this service');
//   }

//   return comments;
// };

const getCommentsByUser = async (userId: string) => {
  return await Comment.find({
    userId,
    isDeleted: false,
  }).sort({ createdAt: -1 });
};

const deleteComment = async (commentId: string, userId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    // Find the comment
    const comment = await Comment.findOne({
      _id: commentId,
      userId,
      isDeleted: false,
    }).session(session);

    if (!comment) {
      throw new AppError(404, 'Comment not found');
    }

    // Soft delete
    comment.isDeleted = true;
    await comment.save({ session });

    // Recalculate professional average rating
    const professionalId = comment.professionalId;

    const ratings = await Comment.aggregate([
      { $match: { professionalId, isDeleted: false } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]).session(session);

    const professional =
      await Professional.findById(professionalId).session(session);

    if (professional) {
      professional.averageRating = ratings[0]?.avgRating || 0;
      await professional.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return null;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
const getSensitiveComments = async (serviceId: string) => {
  return await Comment.find({ serviceId })
    .sort({ isDeleted: 1 })
    .populate('userId', 'name email')
    .populate('serviceId', 'title serviceType')
    .populate('bookingId', 'status durationInMinutes scheduleType')
    .sort({ createdAt: -1 });
};

export const CommentServices: any = {
  createComment,
  getAllComments,
  getCommentsByUser,
  deleteComment,
  getSensitiveComments,
};
