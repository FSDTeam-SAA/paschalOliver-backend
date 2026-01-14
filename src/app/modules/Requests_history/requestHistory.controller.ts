import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { RequestHistoryServices } from './requestHistory.service';
import httpStatus from 'http-status-codes';

// Get professional's request history
const getRequestHistory: RequestHandler = catchAsync(async (req, res) => {
  const professionalId = req.user.id;
  const { status, page, limit } = req.query;

  const result = await RequestHistoryServices.getRequestHistory(
    professionalId,
    status as any,
    page as unknown as number,
    limit as unknown as number,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Request history retrieved successfully',
    data: result,
  });
});

// Get single request history details
const getRequestHistoryDetails: RequestHandler = catchAsync(
  async (req, res) => {
    const { id } = req.params;

    const result = await RequestHistoryServices.getRequestHistoryDetails(
      id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Request history details retrieved successfully',
      data: result,
    });
  },
);

// Accept a request
const acceptRequest: RequestHandler = catchAsync(async (req, res) => {
  const professionalId = req.user.id;
  const { id } = req.params;

  const result = await RequestHistoryServices.acceptRequest(
    professionalId,
    id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Request accepted successfully',
    data: result,
  });
});

// Reject a request
const rejectRequest: RequestHandler = catchAsync(async (req, res) => {
  const professionalId = req.user.id;
  const { id } = req.params;

  const result = await RequestHistoryServices.rejectRequest(
    professionalId,
    id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Request rejected successfully',
    data: result,
  });
});

export const RequestHistoryControllers = {
  getRequestHistory,
  getRequestHistoryDetails,
  acceptRequest,
  rejectRequest,
};
