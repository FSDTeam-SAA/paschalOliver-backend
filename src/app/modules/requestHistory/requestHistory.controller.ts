import pick from '../../helper/pick';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { requestHistoryService } from './requestHistory.service';

const getMyRequestHistory = catchAsync(async (req, res) => {
  const professionalId = req.user.id;
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  const result = await requestHistoryService.getMyRequestHistory(
    professionalId,
    options,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Request history retrieved successfully',
    data: result,
  });
});

export const requestHistoryController = {
  getMyRequestHistory,
};
