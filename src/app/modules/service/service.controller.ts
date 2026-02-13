import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { serviceService } from './service.service';

const getMyServices = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await serviceService.getMyServices(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Services retrieved successfully',
    data: result,
  });
});

const getSingleServiceDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await serviceService.getSingleServiceDetails(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Service details retrieved successfully',
    data: result,
  });
});

const cancelService = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await serviceService.cancelService(id as string, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Service cancelled successfully',
    data: result,
  });
});

export const serviceController = {
  getMyServices,
  getSingleServiceDetails,
  cancelService,
};
