import express from 'express';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';
import { FavoriteControllers } from './favorite.controller';

const router = express.Router();

router.get('/', auth(userRole.client), FavoriteControllers.getMyFavorites);
router.post('/', auth(userRole.client), FavoriteControllers.toggleFavorite);

export const FavoriteRoutes = router;
