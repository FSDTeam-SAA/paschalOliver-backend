import pick from '../../helper/pick';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { handymanService } from './handyman.service';

const createHandymanRequest = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const result = await handymanService.createHandymanRequest(req.body, userId);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Request created successfully',
    data: result,
  });
});

const getMyHandymanRequests = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const status = req.query.status as string;

  const result = await handymanService.getMyHandymanRequests(userId, options, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Requests retrieved successfully',
    data: result,
  });
});

const getHandymanRequestById = catchAsync(async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  const result = await handymanService.getHandymanRequestById(id!, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Request retrieved successfully',
    data: result,
  });
});

const updateHandymanRequest = catchAsync(async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  const result = await handymanService.updateHandymanRequest(id!, req.body, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Request updated successfully',
    data: result,
  });
});

const cancelHandymanRequest = catchAsync(async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  const result = await handymanService.cancelHandymanRequest(id!, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Request cancelled successfully',
    data: result,
  });
});

/**
 * Professional
 */
const getProfessionalInbox = catchAsync(async (req, res) => {
  const professionalId = req.user.id;
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  const result = await handymanService.getProfessionalInbox(professionalId, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Inbox retrieved successfully',
    data: result,
  });
});

const professionalUpdateStatus = catchAsync(async (req, res) => {
  const professionalId = req.user.id;
  const id = req.params.id;
  const { status } = req.body; // ACCEPTED | REJECTED | COMPLETED

  const result = await handymanService.professionalUpdateStatus(id!, status, professionalId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Request status updated successfully',
    data: result,
  });
});

const searchProfessionalSubCategoryBased = catchAsync(async(req, res) =>{

    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await handymanService.searchProfessionalSubCategoryBased(options);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Get all professional successfully',
        data: result,
  });

})

export const handymanController = {
  createHandymanRequest,
  getMyHandymanRequests,
  getHandymanRequestById,
  updateHandymanRequest,
  cancelHandymanRequest,

  getProfessionalInbox,
  professionalUpdateStatus,
  searchProfessionalSubCategoryBased
};
