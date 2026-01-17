import { Favorite } from './favorite.model';
import { Professional } from '../professional/professional.model';
import AppError from '../../error/appError';

const toggleFavorite = async (userId: string, professionalId: string) => {
  const isProfessionalExist = await Professional.findById(professionalId);
  if (!isProfessionalExist) {
    throw new AppError(404, 'Professional not found');
  }

  const isAlreadyFavorite = await Favorite.findOne({
    user: userId,
    professional: professionalId,
  });

  if (isAlreadyFavorite) {
    await Favorite.findByIdAndDelete(isAlreadyFavorite._id);
    return { message: 'Removed from favorites', status: false };
  } else {
    await Favorite.create({ user: userId, professional: professionalId });
    return { message: 'Added to favorites', status: true };
  }
};

const getMyFavorites = async (userId: string) => {
  const result = await Favorite.find({ user: userId }).populate({
    path: 'professional',
    select: 'user',
    populate: {
      path: 'user',
      select: 'name image',
    },
  });

  return result;
};

export const FavoriteServices = {
  toggleFavorite,
  getMyFavorites,
};
