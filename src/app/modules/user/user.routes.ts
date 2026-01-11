import express from 'express';
import { UserControllers } from './user.controller';
import auth from '../../middlewares/auth';
import { userRole } from './user.constant';
import { UserValidation } from './user.validation';
import { fileUploader } from '../../helper/fileUploder';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

// Route: POST /api/v1/users
router.get('/:id', auth(userRole.client), UserControllers.getUserProfile);

router.patch(
  '/:id',
  auth(userRole.client, userRole.professional, userRole.admin),
  fileUploader.upload.single('image'),
  UserControllers.updatePersonalDetails,
);

router.delete(
  '/:id',
  auth(userRole.client, userRole.professional, userRole.admin),
  UserControllers.deleteAccount,
);

export const UserRoutes = router;

// router.post(
//   '/create-user',
//   validationRequest(userValidation.userSchema),
//   userController.createUser,
// );

// router.get(
//   '/profile',
//   auth(userRole.admin, userRole.contractor, userRole.user),
//   userController.profile,
// );
// router.put(
//   '/profile',
//   auth(userRole.admin, userRole.contractor, userRole.user),
//   fileUploader.upload.single('profileImage'),
//   userController.updateUserById,
// );

// router.get('/all-user', auth(userRole.admin), userController.getAllUser);
// router.get('/:id', auth(userRole.admin), userController.getUserById);

// router.delete('/:id', auth(userRole.admin), userController.deleteUserById);

// export const userRoutes = router;
