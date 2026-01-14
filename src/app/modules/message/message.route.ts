import express from 'express';
import { ListingControllers } from './listing.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ListingValidations } from './listing.validation';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';

const router = express.Router();

router.post(
  '/',
  auth(userRole.professional),
  validateRequest(ListingValidations.createListingValidationSchema),
  ListingControllers.createListing,
);

router.get(
  '/my-listings',
  auth(userRole.professional),
  ListingControllers.getMyListings,
);

router.patch(
  '/:id',
  auth(userRole.professional),
  validateRequest(ListingValidations.updateListingValidationSchema),
  ListingControllers.updateListing,
);

router.delete(
  '/:id',
  auth(userRole.professional),
  ListingControllers.deleteListing,
);

export const ListingRoutes = router;
