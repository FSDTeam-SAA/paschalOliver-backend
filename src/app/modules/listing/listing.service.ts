import { Professional } from '../professional/professional.model';
import { IListing } from './listing.interface';
import { Listing } from './listing.model';
import AppError from '../../error/appError';
import { User } from '../user/user.model';
import { IProfileDetails } from '../professional/professional.interface';
import { Subcategory } from '../subcategory/subcategory.model';

interface ICreateListingPayload extends IListing {
  gallery?: string[];
  about?: string;
  profileDetails?: IProfileDetails;
}

const createListing = async (
  userId: string,
  payload: ICreateListingPayload,
) => {
  const professional = await Professional.findOne({ user: userId });
  if (!professional) {
    throw new AppError(
      404,
      'Professional profile not found. Please complete your profile first.',
    );
  }

  // Verify all Subcategories exist
  if (payload.subcategories && payload.subcategories.length > 0) {
    const count = await Subcategory.countDocuments({
      _id: { $in: payload.subcategories },
    });

    if (count !== payload.subcategories.length) {
      throw new AppError(404, 'One or more subcategories do not exist');
    }
  }

  const { gallery, about, profileDetails, ...listingData } = payload;

  listingData.professional = professional._id;
  const result = await Listing.create(listingData);

  if (profileDetails) {
    await Professional.findByIdAndUpdate(
      professional._id,
      {
        $set: { profileDetails: profileDetails },
      },
      { new: true, runValidators: true },
    );
  }

  if (gallery && gallery.length > 0) {
    await Professional.findByIdAndUpdate(
      professional._id,
      {
        $addToSet: { gallery: { $each: gallery } },
      },
      { new: true },
    );
  }

  if (about) {
    const userUpdate = await User.findByIdAndUpdate(
      userId,
      { about },
      { new: true, runValidators: true },
    );

    if (!userUpdate) {
      throw new AppError(404, 'User not found');
    }
  }

  return result;
};

const getMyListings = async (userId: string) => {
  const professional = await Professional.findOne({ user: userId });
  if (!professional) {
    throw new AppError(404, 'Professional profile not found');
  }

  const result = await Listing.find({ professional: professional._id })
    .populate('service', 'title image')
    .populate('subcategory', 'title image')
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

const updateProfileDetails = async (userId: string, payload: any) => {
  const result = await Professional.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        profileDetails: payload,
      },
    },
    { new: true, runValidators: true },
  );
  if (!result) {
    throw new AppError(404, 'Professional Profile not found');
  }
  return result.profileDetails as string;
};

const addToGallery = async (userId: string, imageUrls: string[]) => {
  const result = await Professional.findOneAndUpdate(
    { user: userId },
    {
      $addToSet: { gallery: { $each: imageUrls } },
    },
    { new: true },
  );

  if (!result) {
    throw new AppError(404, 'Professional profile not found');
  }
  return result.gallery;
};

const getGallery = async (userId: string) => {
  const result = await Professional.findOne({ user: userId }).select('gallery');
  if (!result) {
    throw new AppError(404, 'Professional profile not found');
  }
  return result.gallery;
};

const removeFromGallery = async (userId: string, imageToRemove: string) => {
  const result = await Professional.findOneAndUpdate(
    { user: userId },
    {
      $pull: { gallery: imageToRemove },
    },
    { new: true },
  );

  if (!result) {
    throw new AppError(404, 'Professional profile not found');
  }
  return result.gallery;
};

export const ListingServices = {
  createListing,
  getMyListings,
  updateListing,
  deleteListing,
  updateProfileDetails,
  addToGallery,
  getGallery,
  removeFromGallery,
};
