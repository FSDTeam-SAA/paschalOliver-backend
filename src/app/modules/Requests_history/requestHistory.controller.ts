import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

// import httpStatus from 'http-status-codes';

import { IrequestQuery } from './requestHistory.interface';
import { RequestHistoryServices } from './requestHistory.service';

// Get professional's request history

const getRequestHistory: RequestHandler = catchAsync(async (req, res) => {
  console.log('controller started');
  const userId = req.user.id;
  const { status, page, limit } = req.query as unknown as IrequestQuery;

  const result = await RequestHistoryServices.getRequestHistory(
    userId,
    status,
    Number(page) || 1,
    Number(limit) || 10,
  );

  sendResponse(res, {
    statusCode: 200,
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
      statusCode: 200,
      success: true,
      message: 'Request history details retrieved successfully',
      data: result,
    });
  },
);

// Accept a request
const acceptRequest: RequestHandler = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const result = await RequestHistoryServices.acceptRequest(
    userId,
    id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Request accepted successfully',
    data: result,
  });
});

// Reject a request
const rejectRequest: RequestHandler = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const result = await RequestHistoryServices.rejectRequest(
    userId,
    id as string,
  );

  sendResponse(res, {
    statusCode: 200,
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
