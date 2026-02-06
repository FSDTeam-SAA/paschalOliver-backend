import { Professional } from './professional.model';
import { IProfessional } from './professional.interface';
import AppError from '../../error/appError';
import { Listing } from '../listing/listing.model';
import { Address } from '../address/address.model';

const createProfessionalProfile = async (
  userId: string,
  payload: IProfessional,
) => {
  const isExist = await Professional.findOne({ user: userId });
  if (isExist) {
    throw new AppError(409, 'Professional profile already exists');
  }
  payload.user = userId as any;
  const result = await Professional.create(payload);
  return result;
};

const updateProfessionalProfile = async (
  userId: string,
  payload: Partial<IProfessional>,
) => {
  const result = await Professional.findOneAndUpdate(
    { user: userId },
    payload,
    {
      new: true,
      upsert: true,
      runValidators: true,
    },
  );
  return result;
};

const getProfile = async (userId: string) => {
  const result = await Professional.findOne({ user: userId }).populate('user');
  return result;
};

const getSingleProfessional = async (id: string) => {
  const professional = await Professional.findById(id)
    .populate('user', 'name image about')
    .select('gallery profileDetails user')
    .populate({
      path: 'comments',
      match: { isDeleted: false },
      select: 'comment review',
    });

  if (!professional) {
    throw new AppError(404, 'Professional not found');
  }

  return {
    professional,
  };
};

const searchBySubcategory = async (subcategoryId: string, userId: string) => {
  const userAddress = await Address.findOne({ user: userId, isDefault: true });
  const userArea = userAddress?.area;

  const professionalIds = await Listing.find({
    subcategory: subcategoryId,
    isActive: true,
  }).distinct('professional');

  const query: any = {
    _id: { $in: professionalIds }, // Must be in the list we just found
    isVerified: true, // Optional: Only show verified pros
  };

  if (userArea) {
    query.workingAreas = userArea;
  }

  const result = await Professional.find(query).select('gallery').populate({
    path: 'user',
    select: 'name image',
  });
  return result;
};

const updateProfessionalStatus = async (id: string, status: string) => {
  const professional = await Professional.findById(id);

  if (!professional) {
    throw new AppError(404, 'Professional not found');
  }

  const result = await Professional.findByIdAndUpdate(
    id,
    { status },
    { new: true },
  );

  return result;
};

export const ProfessionalServices = {
  createProfessionalProfile,
  updateProfessionalProfile,
  getProfile,
  getSingleProfessional,
  searchBySubcategory,
  updateProfessionalStatus,
};
