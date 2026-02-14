import { Favorite } from './favorite.model';
import { Professional } from '../professional/professional.model';
import AppError from '../../error/appError';
import mongoose from 'mongoose';

const toggleFavorite = async (
  userId: string,
  professionalId: string,
  subcategoryId: string,
) => {
  const isProfessionalExist = await Professional.findById(professionalId);
  if (!isProfessionalExist) {
    throw new AppError(404, 'Professional not found');
  }

  const isAlreadyFavorite = await Favorite.findOne({
    user: userId,
    professional: professionalId,
    subcategory: subcategoryId,
  });

  if (isAlreadyFavorite) {
    await Favorite.findByIdAndDelete(isAlreadyFavorite._id);
    return { message: 'Removed from favorites', status: false };
  } else {
    await Favorite.create({
      user: userId,
      professional: professionalId,
      subcategory: subcategoryId,
    });
    return { message: 'Added to favorites', status: true };
  }
};

const getMyFavorites = async (userId: string) => {
  // const result = await Favorite.aggregate([
  //   // 1. Match Favorites for the User
  //   {
  //     $match: { user: new mongoose.Types.ObjectId(userId) },
  //   },

  //   // 2. Lookup Subcategory (Get Title & Image)
  //   {
  //     $lookup: {
  //       from: 'subcategories', // DB collection name
  //       localField: 'subcategory',
  //       foreignField: '_id',
  //       as: 'subcategoryDetails',
  //     },
  //   },
  //   { $unwind: '$subcategoryDetails' },

  //   // 3. Lookup Professional (Get Gallery & User ref)
  //   {
  //     $lookup: {
  //       from: 'professionals',
  //       localField: 'professional',
  //       foreignField: '_id',
  //       as: 'proDetails',
  //     },
  //   },
  //   { $unwind: '$proDetails' },

  //   // 4. Lookup User (Get Name & Profile Image)
  //   {
  //     $lookup: {
  //       from: 'users',
  //       localField: 'proDetails.user',
  //       foreignField: '_id',
  //       as: 'userDetails',
  //     },
  //   },
  //   { $unwind: '$userDetails' },

  //   // 5. Lookup Listing (Get Price)
  //   {
  //     $lookup: {
  //       from: 'listings',
  //       let: { proId: '$professional', subId: '$subcategory' },
  //       pipeline: [
  //         {
  //           $match: {
  //             $expr: {
  //               $and: [
  //                 { $eq: ['$professional', '$$proId'] },
  //                 { $in: ['$$subId', '$subcategories'] },
  //               ],
  //             },
  //           },
  //         },
  //         { $project: { price: 1 } },
  //       ],
  //       as: 'listingDetails',
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: '$listingDetails',
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },

  //   // 6. Lookup Comments (Get Rating & Count)
  //   {
  //     $lookup: {
  //       from: 'comments',
  //       let: { proId: '$professional' },
  //       pipeline: [
  //         { $match: { $expr: { $eq: ['$professionalId', '$$proId'] } } },
  //         {
  //           $group: {
  //             _id: null,
  //             avgRating: { $avg: '$rating' },
  //             totalReviews: { $sum: 1 },
  //           },
  //         },
  //       ],
  //       as: 'reviewStats',
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: '$reviewStats',
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },

  //   // 7. Group by Subcategory Title
  //   {
  //     $group: {
  //       _id: '$subcategoryDetails.title',
  //       subcategoryImage: { $first: '$subcategoryDetails.image' },
  //       items: {
  //         $push: {
  //           _id: '$proDetails._id',
  //           name: '$userDetails.name',
  //           image: '$userDetails.image',
  //           gallery: '$proDetails.gallery',
  //           price: { $ifNull: ['$listingDetails.price', 0] },
  //           rating: { $ifNull: ['$reviewStats.avgRating', 0] },
  //           reviewCount: { $ifNull: ['$reviewStats.totalReviews', 0] },
  //         },
  //       },
  //     },
  //   },

  //   // 8. Reformat Output
  //   {
  //     $project: {
  //       subcategory: '$_id',
  //       image: '$subcategoryImage',
  //       count: { $size: '$items' },
  //       professionals: '$items',
  //       _id: 0,
  //     },
  //   },
  // ]);
 const result = await Favorite.find({ user: userId })
  .populate({
    path: 'subcategory',
    select: 'title image',
  })
  .populate({
    path: 'professional',
    select: 'user', 
    populate: {
      path: 'user',
      select: 'name email image',
    },
  });


  return result;
}

const getSingleFavorite = async (userId: string, professionalId: string) => {
  const result = await Favorite.findOne({
    user: userId,
    professional: professionalId,
  })
  .populate({path: 'professional', populate: { path: 'user', select: 'name email image' } })

  return result;
}

export const FavoriteServices = {
  toggleFavorite,
  getMyFavorites,
  getSingleFavorite,
};
