import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import {
  approveProfessionalService,
  dasboardData,
  getAllProfessionalsService,
  getAllUsersService,
  getProfessionalRegistrationRequests,
  rejectProfessionalService,
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

export const getProfessionalRegistrationRequestsController = catchAsync(
  async (req, res) => {
    const { status } = req.query;

    const result = await getProfessionalRegistrationRequests(
      status as 'pending' | 'approved' | 'rejected',
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Professional registration requests retrieved successfully',
      data: result,
    });
  },
);

export const rejectProfessionalController = catchAsync(async (req, res) => {
  const { professionalId } = req.params;
  const result = await rejectProfessionalService(professionalId!);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Professional rejected successfully',
    data: result,
  });
});
export const approveProfessionalController = catchAsync(async (req, res) => {
  const { professionalId } = req.params;
  const result = await approveProfessionalService(professionalId!);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Professional approved successfully',
    data: result,
  });
});
