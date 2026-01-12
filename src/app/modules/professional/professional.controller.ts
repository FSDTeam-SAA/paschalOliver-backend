import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ProfessionalServices } from './professional.service';

const updateProfile = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await ProfessionalServices.updateProfessionalProfile(
    userId,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Professional profile updated successfully',
    data: result,
  });
});

const getProfile = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await ProfessionalServices.getProfessionalProfile(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Professional profile retrieved successfully',
    data: result,
  });
});

export const ProfessionalControllers = {
  updateProfile,
  getProfile,
};
