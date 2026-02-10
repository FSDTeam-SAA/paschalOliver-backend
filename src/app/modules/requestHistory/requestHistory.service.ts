import pagination, { IOption } from '../../helper/pagenation';
import Handyman from '../handyman/handyman.model';

const getMyRequestHistory = async (
  professionalId: string,
  options: IOption,
) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);

  // Match all jobs for this professional
  const filter = { professionalId };

  const result = await Handyman.find(filter)
    .populate('userId') // Client details
    .populate('subCategoryId', 'title') // Service details
    .populate('address') // Location details
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder } as any);

  const total = await Handyman.countDocuments(filter);

  return {
    data: result,
    meta: { total, page, limit },
  };
};

export const requestHistoryService = {
  getMyRequestHistory,
};
