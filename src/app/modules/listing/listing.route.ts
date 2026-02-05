import express from 'express';
import { ListingControllers } from './listing.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ListingValidations } from './listing.validation';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';
import { ProfessionalValidations } from '../professional/professional.validation';
import { fileUploader } from '../../helper/fileUploder';

const router = express.Router();

// Gallery Routes
router.post(
  '/gallery',
  auth(userRole.professional),
  fileUploader.upload.array('gallery'),
  ListingControllers.addToGallery,
);
router.get(
  '/gallery',
  auth(userRole.professional),
  ListingControllers.getGallery,
);
router.delete(
  '/gallery',
  auth(userRole.professional),
  ListingControllers.removeFromGallery,
);

// listing routes
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

router.put(
  '/profile-details',
  auth(userRole.professional),
  validateRequest(ProfessionalValidations.updateProfessionalValidationSchema),
  ListingControllers.updateProfileDetails,
);

router.put(
  '/about',
  auth(userRole.professional),
  validateRequest(ListingValidations.updateAboutValidationSchema),
  ListingControllers.updateAboutMe,
);

export const ListingRoutes = router;
