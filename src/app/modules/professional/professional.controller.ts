import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { fileUploader } from '../../helper/fileUploder';
import { ProfessionalServices } from './professional.service';
import AppError from '../../error/appError';

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!files || !files.documentFrontImage || !files.documentFrontImage[0]) {
    throw new AppError(400, 'Front ID image is required');
  }
  if (!files || !files.documentBackImage || !files.documentBackImage[0]) {
    throw new AppError(400, 'Back ID image is required');
  }

  const frontImageResult = await fileUploader.uploadToCloudinary(
    files.documentFrontImage[0],
  );
  const backImageResult = await fileUploader.uploadToCloudinary(
    files.documentBackImage[0],
  );

  req.body.identity = req.body.identity || {};
  req.body.identity.documentFrontImage = frontImageResult?.url;
  req.body.identity.documentBackImage = backImageResult?.url;

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

const getProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await ProfessionalServices.getProfessionalProfile(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Professional profile retrieved successfully',
    data: result,
  });
});

const getSingleProfessional = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ProfessionalServices.getProfessionalDetails(
      id as string,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Professional details retrieved successfully',
      data: result,
    });
  },
);

export const ProfessionalControllers = {
  updateProfile,
  getProfile,
  getSingleProfessional,
};
