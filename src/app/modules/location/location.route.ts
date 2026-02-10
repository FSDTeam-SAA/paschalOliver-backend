import express from 'express';
import { LocationControllers } from './location.controller';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';

const router = express.Router();

router.post('/', auth(userRole.admin), LocationControllers.createLocation);
router.get('/', LocationControllers.getAllLocations);

export const LocationRoutes = router;
