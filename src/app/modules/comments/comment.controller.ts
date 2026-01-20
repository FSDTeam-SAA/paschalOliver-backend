import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { CommentServices } from './comment.service';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../error/appError';

interface ICreateCommentBody {
  comment?: string;
  review: {
    service: number;
    communication: number;
    kindness: number;
    comfort: number;
  };
  bookingId: string; // Must be sent by client
}

// Create Comment
const createComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { professionalId } = req.params;

  const { bookingId, ...payload } = req.body as ICreateCommentBody;

  if (!bookingId) {
    throw new AppError(400, 'Booking ID is required to leave a comment');
  }

  const result = await CommentServices.createComment(
    userId,
    professionalId as string,
    bookingId,
    payload,
  );
  if (!result) {
    throw new AppError(400, 'Failed to create comment');
  }

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Comment created successfully',
    data: result,
  });
});

// Get All Comments for indivual Service
const getAllComments = catchAsync(async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  if (!serviceId)
    throw new AppError(400, 'Service ID is required to get comments');
  const result = await CommentServices.getAllComments(serviceId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Comments retrieved successfully',
    data: result,
  });
});

// --- Get Comments for Logged-in User ---
const getMyComments = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const result = await CommentServices.getCommentsByUser(userId);
  if (result && result.length === 0)
    throw new AppError(400, 'No comments found or you not commented yet');

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User comments retrieved successfully',
    data: result,
  });
});

// Delete Comment (soft delete)
const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  await CommentServices.deleteComment(commentId as string, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Comment deleted successfully',
    data: null,
  });
});

export const CommentControllers = {
  createComment,
  getAllComments,
  getMyComments,
  deleteComment,
};
