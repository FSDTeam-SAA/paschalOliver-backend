import mongoose, { Types } from 'mongoose';
import Handyman from '../handyman/handyman.model';
import AppError from '../../error/appError';

const getMyServices = async (userId: string) => {
  const result = await Handyman.aggregate([
    // 1. Match All Requests for this User
    {
      $match: {
        userId: new Types.ObjectId(userId),
      },
    },

    // 2. Lookup Subcategory (Service Title & Image)
    {
      $lookup: {
        from: 'subcategories',
        localField: 'subCategoryId',
        foreignField: '_id',
        as: 'subcategoryDetails',
      },
    },
    { $unwind: '$subcategoryDetails' },

    // 3. Lookup Professional Info (if assigned)
    {
      $lookup: {
        from: 'professionals',
        localField: 'professionalId',
        foreignField: '_id',
        as: 'proDetails',
      },
    },
    {
      $unwind: {
        path: '$proDetails',
        preserveNullAndEmptyArrays: true,
      },
    },

    // 4. Lookup Pro's User Account (Name, Image)
    {
      $lookup: {
        from: 'users',
        localField: 'proDetails.user',
        foreignField: '_id',
        as: 'proUser',
      },
    },
    {
      $unwind: {
        path: '$proUser',
        preserveNullAndEmptyArrays: true,
      },
    },

    // 5. Lookup Listing (To get the Price shown on card)
    {
      $lookup: {
        from: 'listings',
        let: { proId: '$professionalId', subId: '$subCategoryId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  // Check if proId exists before comparing
                  { $eq: ['$professional', { $ifNull: ['$$proId', null] }] },
                  // Ensure subId is checked against an array
                  {
                    $in: ['$$subId', { $ifNull: ['$subcategories', []] }],
                  },
                ],
              },
            },
          },
          { $project: { price: 1 } },
        ],
        as: 'listingDetails',
      },
    },

    // 6. Lookup Reviews (To get Pro's Rating & Count)
    {
      $lookup: {
        from: 'comments',
        let: { proId: '$professionalId' },
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
        as: 'reviewStats',
      },
    },
    {
      $unwind: {
        path: '$reviewStats',
        preserveNullAndEmptyArrays: true,
      },
    },

    // 7. Sort by Newest First
    { $sort: { createdAt: -1 } },

    // 8. Final Shape
    {
      $project: {
        _id: 1,
        status: 1,
        schedule: 1, // Contains date, timeWindow, etc.
        serviceName: '$subcategoryDetails.title',
        categoryImage: '$subcategoryDetails.image',

        // Professional Object (Null if not assigned yet)
        professional: {
          _id: '$proDetails._id',
          name: '$proUser.name',
          image: '$proUser.image',
          rating: { $ifNull: ['$reviewStats.avgRating', 0] },
          reviewCount: { $ifNull: ['$reviewStats.totalReviews', 0] },
        },

        pricePerHour: { $ifNull: ['$listingDetails.price', 0] },
        createdAt: 1,
      },
    },
  ]);

  return result;
};

const getSingleServiceDetails = async (requestId: string) => {
  const result = await Handyman.findById(requestId)
    .populate({
      path: 'userId',
      select: 'name image email phone', // For the "Contact" info in details
    })
    .populate({
      path: 'professionalId',
      populate: { path: 'user', select: 'name image' },
    })
    .populate('subCategoryId', 'title image')
    .populate('address'); // For the Map and full address text

  if (!result) {
    throw new AppError(404, 'Service request not found');
  }

  return result;
};

const cancelService = async (requestId: string, userId: string) => {
  // 1. Find the request
  const request = await Handyman.findById(requestId);

  if (!request) {
    throw new AppError(404, 'Service request not found');
  }

  // 2. Security Check: Does this request belong to the logged-in client?
  if (request.userId.toString() !== userId) {
    throw new AppError(403, 'You are not authorized to cancel this request');
  }

  // 3. Update Status to CANCELLED
  request.status = 'CANCELLED';
  await request.save();

  return request;
};

export const serviceService = {
  getMyServices,
  getSingleServiceDetails,
  cancelService,
};
