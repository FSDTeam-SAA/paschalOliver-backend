import { z } from 'zod';
import { requestHistoryStatus } from './requestHistory.constant';

const getRequestHistoryQueryValidation = z.object({
  query: z.object({
    status: z
      .enum([
        requestHistoryStatus.new,
        requestHistoryStatus.accepted,
        requestHistoryStatus.completed,
        requestHistoryStatus.cancelled_by_client,
        requestHistoryStatus.cancelled_by_professional,
      ] as const)
      .optional(),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
});

const getRequestHistoryDetailsValidation = z.object({
  params: z.object({
    id: z.string().min(1, 'Request history ID is required'),
  }),
});

const acceptRequestValidation = z.object({
  params: z.object({
    id: z.string().min(1, 'Request history ID is required'),
  }),
  body: z.object({}), // No body needed
});

const rejectRequestValidation = z.object({
  params: z.object({
    id: z.string().min(1, 'Request history ID is required'),
  }),
  body: z.object({}), // No body needed
});

export const RequestHistoryValidation = {
  getRequestHistoryQueryValidation,
  getRequestHistoryDetailsValidation,
  acceptRequestValidation,
  rejectRequestValidation,
};
