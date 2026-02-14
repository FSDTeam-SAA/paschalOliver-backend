import pick from '../../helper/pick';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { requestHistoryService } from './requestHistory.service';

const getMyRequestHistory = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const options = pick(req.query, [
    'limit',
    'page',
    'sortBy',
    'sortOrder',
    'status',
  ]);

  const result = await requestHistoryService.getMyRequestHistory(
    userId,
    options as any,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Request history retrieved successfully',
    data: result,
  });
});

const updateRequestStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const payload = req.body; // Expects { status: '...', clientReview: { ... } }

  const result = await requestHistoryService.updateRequestStatus(
    id as string,
    payload,
    userId,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Request status updated successfully',
    data: result,
  });
});

export const requestHistoryController = {
  getMyRequestHistory,
  updateRequestStatus,
};
