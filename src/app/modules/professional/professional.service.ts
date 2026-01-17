import { Professional } from './professional.model';
import { IProfessional } from './professional.interface';
import AppError from '../../error/appError';
import { Listing } from '../listing/listing.model';

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

const getProfessionalProfile = async (userId: string) => {
  const result = await Professional.findOne({ user: userId }).populate('user');
  return result;
};

const getProfessionalDetails = async (id: string) => {
  const professional = await Professional.findById(id)
    .populate('user', 'name image about')
    .select('gallery profileDetails user');

  if (!professional) {
    throw new AppError(404, 'Professional not found');
  }

  const listings = await Listing.find({ professional: professional._id })
    .populate('service', 'title')
    .select('service selectedOptions')
    .lean(); // Convert to plain JS object for better performance

  return {
    professional,
    listings,
  };
};

export const ProfessionalServices = {
  updateProfessionalProfile,
  getProfessionalProfile,
  getProfessionalDetails,
};
