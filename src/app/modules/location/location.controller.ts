import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { LocationServices } from './location.service';

const createLocation = catchAsync(async (req, res) => {
  const result = await LocationServices.createLocation(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Location created successfully',
    data: result,
  });
});

const getAllLocations = catchAsync(async (req, res) => {
  const result = await LocationServices.getAllLocations();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Locations retrieved successfully',
    data: result,
  });
});

export const LocationControllers = {
  createLocation,
  getAllLocations,
};
