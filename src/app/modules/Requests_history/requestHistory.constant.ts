export const requestHistoryStatus = {
  new: 'new',
  accepted: 'accepted',
  completed: 'completed',
  cancelled_by_client: 'cancelled_by_client',
  cancelled_by_professional: 'cancelled_by_professional',
} as const;

export type TRequestHistoryStatus =
  (typeof requestHistoryStatus)[keyof typeof requestHistoryStatus];
