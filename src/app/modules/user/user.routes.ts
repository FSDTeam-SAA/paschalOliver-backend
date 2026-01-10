import express from 'express';
import { UserControllers } from './user.controller';

const router = express.Router();

// Route: POST /api/v1/users
router.post('/create-user', UserControllers.createUser);
router.get('/:id', UserControllers.getUserProfile);
router.patch('/:id', UserControllers.updateUserProfile);

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
