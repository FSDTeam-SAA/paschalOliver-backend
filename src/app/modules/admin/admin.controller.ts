import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import {
  dasboardData,
  getAllProfessionalsService,
  getAllUsersService,
} from './admin.service';

export const dashboardData = catchAsync(async (req, res) => {
  const result = await dasboardData();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Dashboard data retrieved successfully',
    data: result,
  });
});
export const getAllUsers = catchAsync(async (req, res) => {
  const result = await getAllUsersService();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users data retrieved successfully',
    data: result,
  });
});
export const getAllProfessional = catchAsync(async (req, res) => {
  const result = await getAllProfessionalsService();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users data retrieved successfully',
    data: result,
  });
});
