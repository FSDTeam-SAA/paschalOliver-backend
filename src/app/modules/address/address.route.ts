import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { userRole } from '../user/user.constant';
import { AddressControllers } from './address.controller';
import { AddressValidation } from './address.validation';

const router = express.Router();

router.post(
  '/',
  auth(userRole.client, userRole.professional, userRole.admin),
  validateRequest(AddressValidation.createAddressSchema),
  AddressControllers.createAddress,
);

router.get(
  '/',
  auth(userRole.client, userRole.professional, userRole.admin),
  AddressControllers.getAddresses,
);

router.patch(
  '/:id',
  auth(userRole.client, userRole.professional, userRole.admin),
  validateRequest(AddressValidation.updateAddressSchema),
  AddressControllers.updateAddress,
);

router.delete(
  '/:id',
  auth(userRole.client, userRole.professional, userRole.admin),
  AddressControllers.deleteAddress,
);

export const AddressRoutes = router;
