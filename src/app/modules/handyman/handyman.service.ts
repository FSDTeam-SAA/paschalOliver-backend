import pagination, { IOption } from '../../helper/pagenation';
import AppError from '../../error/appError';
import { Types } from 'mongoose';
import { IHandymanRequest } from './handyman.interface';
import Handyman from './handyman.model';
import { Professional } from '../professional/professional.model';
import { Address } from '../address/address.model';

const validateSchedule = (payload: Partial<IHandymanRequest>) => {
  const s = payload.schedule;
  if (!s) return;

  if (s.frequency === 'JUST_ONCE') {
    if (!s.date)
      throw new AppError(400, 'schedule.date is required for JUST_ONCE');
  } else {
    if (!s.daysOfWeek || s.daysOfWeek.length === 0) {
      throw new AppError(
        400,
        'schedule.daysOfWeek is required for recurring schedules',
      );
    }
  }

  if (s.startType === 'EXACT' && !s.exactStartAt) {
    throw new AppError(
      400,
      'schedule.exactStartAt is required when startType is EXACT',
    );
  }
};

// const validateAddresses = (payload: Partial<IHandymanRequest>) => {
//   const addresses = payload.addresses;

//   if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
//     throw new AppError(400, 'addresses is required and must be a non-empty array');
//   }

//   // basic required fields check (simple)
//   for (const a of addresses) {
//     if (!a?.state || !a?.city || !a?.zipcode) {
//       throw new AppError(400, 'Each address must include state, city, zipcode');
//     }
//     if (
//       !a?.coordinates ||
//       typeof a.coordinates.latitude !== 'number' ||
//       typeof a.coordinates.longitude !== 'number'
//     ) {
//       throw new AppError(400, 'Each address must include coordinates { latitude, longitude }');
//     }
//   }
// };

const createHandymanRequest = async (
  payload: Omit<IHandymanRequest, 'userId' | 'status' | 'address'>,
  userId: string,
) => {
  // 1. Validate Schedule
  validateSchedule({ schedule: payload.schedule } as any);

  // 2. Automatic Address Selection: Find the user's default address
  const userAddress = await Address.findOne({ user: userId, isDefault: true });

  if (!userAddress) {
    throw new AppError(
      404,
      'No default address found. Please set a default address in your profile.',
    );
  }

  // 3. Prepare data with the found address ID
  const data: Partial<IHandymanRequest> = {
    ...payload,
    userId: new Types.ObjectId(userId),
    address: userAddress._id, // Set the address ID from DB
    status: 'PENDING',
  };

  const result = await Handyman.create(data);
  return result;
};

const getMyHandymanRequests = async (userId: string, options: IOption) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);

  const result = await Handyman.find({ userId })
    .populate('subCategoryId')
    .populate('categoryId')
    .populate('professionalId')
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder } as any);

  const total = await Handyman.countDocuments({ userId });

  return {
    data: result,
    meta: { total, page, limit },
  };
};

const getHandymanRequestById = async (id: string, userId?: string) => {
  const reqDoc = await Handyman.findById(id)
    .populate('subCategoryId')
    .populate('categoryId')
    .populate('professionalId');

  if (!reqDoc) throw new AppError(404, 'Request not found');

  if (userId && reqDoc.userId.toString() !== userId) {
    throw new AppError(403, 'You are not allowed to view this request');
  }

  return reqDoc;
};

const updateHandymanRequest = async (
  id: string,
  payload: Partial<IHandymanRequest>,
  userId: string,
) => {
  const reqDoc = await Handyman.findById(id);
  if (!reqDoc) throw new AppError(404, 'Request not found');

  if (reqDoc.userId.toString() !== userId) {
    throw new AppError(403, 'You are not allowed to update this request');
  }

  if (['ACCEPTED', 'COMPLETED'].includes(reqDoc.status)) {
    throw new AppError(400, 'You cannot update an accepted/completed request');
  }

  // ✅ Validate schedule if provided
  if (payload.schedule) validateSchedule(payload);

  const updated = await Handyman.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .populate('subCategoryId')
    .populate('categoryId')
    .populate('professionalId')
    .populate('address');

  return updated;
};

const cancelHandymanRequest = async (id: string, userId: string) => {
  const reqDoc = await Handyman.findById(id);
  if (!reqDoc) throw new AppError(404, 'Request not found');

  if (reqDoc.userId.toString() !== userId) {
    throw new AppError(403, 'You are not allowed to cancel this request');
  }

  if (reqDoc.status === 'COMPLETED') {
    throw new AppError(400, 'Completed request cannot be cancelled');
  }

  reqDoc.status = 'CANCELLED';
  await reqDoc.save();

  return reqDoc;
};

/**
 * Professional side
 */
const getProfessionalInbox = async (
  professionalId: string,
  options: IOption,
) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);

  const filter = { professionalId, status: 'PENDING' };

  const result = await Handyman.find(filter)
    .populate('subCategoryId')
    .populate('categoryId')
    .populate('userId')
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder } as any);

  const total = await Handyman.countDocuments(filter);

  return { data: result, meta: { total, page, limit } };
};

const professionalUpdateStatus = async (
  id: string,
  status: 'ACCEPTED' | 'REJECTED' | 'COMPLETED',
  professionalId: string,
) => {
  const reqDoc = await Handyman.findById(id);
  if (!reqDoc) throw new AppError(404, 'Request not found');

  if (
    !reqDoc.professionalId ||
    reqDoc.professionalId.toString() !== professionalId
  ) {
    throw new AppError(403, 'You are not allowed to update this request');
  }

  if (status === 'COMPLETED' && reqDoc.status !== 'ACCEPTED') {
    throw new AppError(400, 'Only accepted request can be completed');
  }

  if (['CANCELLED', 'COMPLETED'].includes(reqDoc.status)) {
    throw new AppError(400, `Cannot update a ${reqDoc.status} request`);
  }

  reqDoc.status = status;
  await reqDoc.save();

  return reqDoc;
};

const searchProfessionalSubCategoryBased = async (options: IOption) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);

  const result = await Professional.find()
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder } as any);

  const total = await Professional.countDocuments();

  return {
    data: result,
    meta: { total, page, limit },
  };
};

export const handymanService = {
  createHandymanRequest,
  getMyHandymanRequests,
  getHandymanRequestById,
  updateHandymanRequest,
  cancelHandymanRequest,

  getProfessionalInbox,
  professionalUpdateStatus,
  searchProfessionalSubCategoryBased,
};
