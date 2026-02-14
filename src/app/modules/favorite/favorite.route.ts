import express from 'express';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';
import { FavoriteControllers } from './favorite.controller';

const router = express.Router();

router.post('/', auth(userRole.client), FavoriteControllers.toggleFavorite);
router.get('/', auth(userRole.client), FavoriteControllers.getMyFavorites);
router.get('/:professionalId', auth(userRole.client), FavoriteControllers.getSingleFavorite);

export const FavoriteRoutes = router;
