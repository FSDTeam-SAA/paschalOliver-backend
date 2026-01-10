import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../helper/pick';
import { UserServices } from './user.service';

const createUser = catchAsync(async (req, res) => {
  const result = await UserServices.createUser(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User created successfully',
    data: result,
  });
});

const getUserProfile = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.getUserProfile(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User profile retrieved successfully',
    data: result,
  });
});

const updateUserProfile = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.updateUserProfile(id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User profile updated successfully',
    data: result,
  });
});

export const UserControllers = {
  createUser,
  getUserProfile,
  updateUserProfile,
};

// const getAllUser = catchAsync(async (req, res) => {
//   const filters = pick(req.query, ['searchTerm', 'role', 'name', 'email']);
//   const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
//   const result = await userService.getAllUser(filters, options);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'User fetched successfully',
//     meta: result.meta,
//     data: result.data,
//   });
// });

// const getUserById = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   if (!id) {
//     throw new Error('User ID is required');
//   }
//   const result = await userService.getUserById(id);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'User fetched successfully',
//     data: result,
//   });
// });

// const updateUserById = catchAsync(async (req, res) => {
//   const file = req.file;
//   const fromData = req.body.data ? JSON.parse(req.body.data) : req.body;
//   const result = await userService.updateUserById(req.user.id, fromData, file);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'User updated successfully',
//     data: result,
//   });
// });

// const deleteUserById = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   if (!id) {
//     throw new Error('User ID is required');
//   }
//   const result = await userService.deleteUserById(id);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'User deleted successfully',
//     data: result,
//   });
// });

// const profile = catchAsync(async (req, res) => {
//   const result = await userService.profile(req.user.id);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'User profile fetched successfully',
//     data: result,
//   });
// });
