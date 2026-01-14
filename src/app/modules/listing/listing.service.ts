import { Professional } from '../professional/professional.model';
import { IListing } from './listing.interface';
import { Listing } from './listing.model';
import AppError from '../../error/appError';

const createListing = async (userId: string, payload: IListing) => {
  const professional = await Professional.findOne({ user: userId });

  console.log(professional);
  if (!professional) {
    throw new AppError(404, 'Professional profile not found');
  }

  payload.professional = professional._id;
  const result = await Listing.create(payload);
  return result;
};

const getMyListings = async (userId: string) => {
  const professional = await Professional.findOne({ user: userId });
  if (!professional) {
    throw new AppError(404, 'Professional profile not found');
  }

  const result = await Listing.find({ professional: professional._id })
    .populate('service', 'title image subCategoryId')
    .sort({ createdAt: -1 });

  return result;
};

const updateListing = async (id: string, payload: Partial<IListing>) => {
  const result = await Listing.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(404, 'Listing not found');
  }
  return result;
};

const deleteListing = async (id: string) => {
  const result = await Listing.findByIdAndDelete(id);

  if (!result) {
    throw new AppError(404, 'Listing not found');
  }
  return result;
};

export const ListingServices = {
  createListing,
  getMyListings,
  updateListing,
  deleteListing,
};
