import express from 'express';
import { UserControllers } from './user.controller';
import auth from '../../middlewares/auth';
import { userRole } from './user.constant';
import { fileUploader } from '../../helper/fileUploder';

const router = express.Router();

// Route: POST /api/v1/users
router.get('/me', auth(userRole.client), UserControllers.getUserProfile);

router.patch(
  '/me',
  auth(userRole.client, userRole.professional, userRole.admin),
  fileUploader.upload.single('image'),
  UserControllers.updatePersonalDetails,
);

router.delete(
  '/me',
  auth(userRole.client, userRole.professional, userRole.admin),
  UserControllers.deleteAccount,
);

router.patch(
  '/change-language',
  auth(userRole.client, userRole.professional, userRole.admin),
  UserControllers.updateUserLanguage,
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
