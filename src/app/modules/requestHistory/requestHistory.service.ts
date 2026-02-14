import AppError from '../../error/appError';
import pagination, { IOption } from '../../helper/pagenation';
import { IClientReview, TRequestStatus } from '../handyman/handyman.interface';
import Handyman from '../handyman/handyman.model';
import { Professional } from '../professional/professional.model';

const getMyRequestHistory = async (
  userId: string,
  options: IOption & { status?: string }, // Added status to options
) => {
  const professional = await Professional.findOne({ user: userId });

  if (!professional) {
    throw new AppError(
      404,
      'Professional profile not found. Please complete your registration.',
    );
  }

  const professionalId = professional._id;
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);

  const filter: any = { professionalId };

  if (options.status) {
    const statusArray = options.status.split(',');
    filter.status = { $in: statusArray };
  }

  const result = await Handyman.find(filter)
    .populate('userId', 'name image')
    .populate('subCategoryId', 'title')
    .populate('address')
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder } as any);

  const total = await Handyman.countDocuments(filter);

  return {
    data: result,
    meta: { total, page, limit },
  };
};

const updateRequestStatus = async (
  id: string,
  payload: { status?: TRequestStatus; clientReview?: IClientReview },
  userId: string,
) => {
  // 1. Find Professional Profile
  const professional = await Professional.findOne({ user: userId });
  if (!professional) throw new AppError(404, 'Professional profile not found');

  // 2. Find Request
  const request = await Handyman.findById(id);
  if (!request) throw new AppError(404, 'Request not found');

  // 3. Authorization Check
  if (
    request.professionalId &&
    request.professionalId.toString() !== professional._id.toString()
  ) {
    throw new AppError(403, 'You are not authorized to update this request');
  }

  // 4. Update Status & Review (if provided)
  if (payload.status) request.status = payload.status;
  if (payload.clientReview) request.clientReview = payload.clientReview;

  await request.save();
  return request;
};

export const requestHistoryService = {
  getMyRequestHistory,
  updateRequestStatus,
};
