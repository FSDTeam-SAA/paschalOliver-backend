import { Comment } from './comment.model';
import AppError from '../../error/appError';
import { Professional } from '../professional/professional.model';
import { Booking } from '../booking/booking.model';
import mongoose from 'mongoose';

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
    const booking = await Booking.findOne({
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
    .sort({ createdAt: -1 });

  if (comments.length === 0) {
    throw new AppError(404, 'No comments found for this service');
  }
  return comments;
};

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
