import express from 'express';
import { RequestHistoryControllers } from './requestHistory.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { RequestHistoryValidation } from './requestHistory.validation';
import auth from '../../../middlewares/auth';
import { userRole } from '../../user/user.constant';

const router = express.Router();

// Get request history with optional status filter
router.get(
  '/',
  auth(userRole.professional),

  RequestHistoryControllers.getRequestHistory,
);

// Get single request history details
router.get(
  '/:id',
  auth(userRole.professional),

  RequestHistoryControllers.getRequestHistoryDetails,
);

// Accept a request
router.patch(
  '/accept/:id',
  auth(userRole.professional),
  validateRequest(RequestHistoryValidation.acceptRequestValidation),
  RequestHistoryControllers.acceptRequest,
);

// Reject a request
router.patch(
  '/reject/:id',
  auth(userRole.professional),
  validateRequest(RequestHistoryValidation.rejectRequestValidation),
  RequestHistoryControllers.rejectRequest,
);

router.patch(
  '/complete/:id',
  auth(userRole.professional),
  RequestHistoryControllers.completeRequest,
);

export const RequestHistoryRoutes = router;
