import { Professional } from './professional.model';
import { IProfessional } from './professional.interface';
import AppError from '../../error/appError';
import { Listing } from '../listing/listing.model';
import { Address } from '../address/address.model';
import catchAsync from '../../utils/catchAsync';
import pagination, { IOption } from '../../helper/pagenation';
import mongoose from 'mongoose';

const createProfessionalProfile = async (
  userId: string,
  payload: IProfessional,
) => {
  const isExist = await Professional.findOne({ user: userId });
  if (isExist) {
    throw new AppError(409, 'Professional profile already exists');
  }
  payload.user = userId as any;
  const result = await Professional.create(payload);
  return result;
};

const updateProfessionalProfile = async (
  userId: string,
  payload: Partial<IProfessional>,
) => {
  const result = await Professional.findOneAndUpdate(
    { user: userId },
    payload,
    {
      new: true,
      upsert: true,
      runValidators: true,
    },
  );
  return result;
};

const getProfile = async (userId: string) => {
  console.log(userId);
  const result = await Professional.findOne({ user: userId }).populate('user');
  return result;
};

const getSingleProfessional = async (id: string) => {
  const professional = await Professional.findById(id)
    .populate('user', 'name image about')
    .select('gallery profileDetails user')
    .populate({
      path: 'comments',
      match: { isDeleted: false },
      select: 'comment review',
    });

  if (!professional) {
    throw new AppError(404, 'Professional not found');
  }

  return {
    professional,
  };
};

const searchBySubcategory = async (subcategoryId: string, userId: string) => {
  // 1. Get User's Default Area
  const userAddress = await Address.findOne({ user: userId, isDefault: true });
  const userArea = userAddress?.area;

  // 2. Aggregation Pipeline starting from Listing
  const result = await Listing.aggregate([
    // Step 1: Match Listings for this Subcategory
    {
      $match: {
        subcategory: new mongoose.Types.ObjectId(subcategoryId),
        // isActive: true, // Uncomment if you want to filter active listings only
      },
    },

    // Step 2: Get Professional Details
    {
      $lookup: {
        from: 'professionals',
        localField: 'professional',
        foreignField: '_id',
        as: 'professional',
      },
    },
    { $unwind: '$professional' },

    // Step 3: Filter by Area (Only if user has a default area)
    ...(userArea
      ? [
          {
            $match: {
              'professional.workingAreas': userArea,
            },
          },
        ]
      : []),

    // Step 4: Get User Details (Name, Image)
    {
      $lookup: {
        from: 'users',
        localField: 'professional.user',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    { $unwind: '$userDetails' },

    // Step 5: Get Review Stats (Rating & Count)
    {
      $lookup: {
        from: 'comments',
        let: { proId: '$professional._id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$professionalId', '$$proId'] } } },
          {
            $group: {
              _id: null,
              avgRating: { $avg: '$rating' },
              totalReviews: { $sum: 1 },
            },
          },
        ],
        as: 'stats',
      },
    },
    {
      $unwind: {
        path: '$stats',
        preserveNullAndEmptyArrays: true,
      },
    },

    // Step 6: Final Projection
    {
      $project: {
        _id: '$professional._id',
        name: '$userDetails.name',
        image: '$userDetails.image',
        gallery: '$professional.gallery',
        price: '$price', // Directly from the Listing document
        rating: { $ifNull: ['$stats.avgRating', 0] },
        reviewCount: { $ifNull: ['$stats.totalReviews', 0] },
      },
    },
  ]);

  return result;
};

const updateProfessionalStatus = async (id: string, status: string) => {
  const professional = await Professional.findById(id);

  if (!professional) {
    throw new AppError(404, 'Professional not found');
  }

  const result = await Professional.findByIdAndUpdate(
    id,
    { status },
    { new: true },
  );

  return result;
};

const getAllProfessionalAccount = async (
  options: IOption,
  subCategory: string,
) => {
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
export const ProfessionalServices = {
  createProfessionalProfile,
  updateProfessionalProfile,
  getProfile,
  getSingleProfessional,
  searchBySubcategory,
  updateProfessionalStatus,
  getAllProfessionalAccount,
};
