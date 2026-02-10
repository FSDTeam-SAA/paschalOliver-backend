import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FavoriteServices } from './favorite.service';

const toggleFavorite = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user;
  const { professionalId, subcategoryId } = req.body;

  const result = await FavoriteServices.toggleFavorite(
    id,
    professionalId,
    subcategoryId,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: result.status,
  });
});

const getMyFavorites = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user;
  const result = await FavoriteServices.getMyFavorites(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Favorites retrieved successfully',
    data: result,
  });
});

export const FavoriteControllers = {
  toggleFavorite,
  getMyFavorites,
};
