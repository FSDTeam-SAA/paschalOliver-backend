import { Favorite } from './favorite.model';
import { Professional } from '../professional/professional.model';
import AppError from '../../error/appError';

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
  const favorites = await Favorite.find({ user: userId })
    .populate({
      path: 'professional',
      select: 'user',
      populate: {
        path: 'user',
        select: 'name image',
      },
    })
    .populate({
      path: 'subcategory',
      select: 'title',
    });

  // Grouping Logic
  const groupedResult = favorites.reduce((acc: any, curr: any) => {
    const groupName = curr.subcategory?.title || 'Other';

    if (!acc[groupName]) {
      acc[groupName] = [];
    }

    if (curr.professional) {
      acc[groupName].push(curr.professional);
    }

    return acc;
  }, {});

  return groupedResult;
};

export const FavoriteServices = {
  toggleFavorite,
  getMyFavorites,
};
