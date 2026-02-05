import AppError from '../../error/appError';
import { fileUploader } from '../../helper/fileUploder';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ListingServices } from './listing.service';

const createListing = catchAsync(async (req, res) => {
  const result = await ListingServices.createListing(req.user.id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Listing created successfully',
    data: result,
  });
});

const getMyListings = catchAsync(async (req, res) => {
  const result = await ListingServices.getMyListings(req.user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Listings retrieved successfully',
    data: result,
  });
});

const updateListing = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ListingServices.updateListing(id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Listing updated successfully',
    data: result,
  });
});

const deleteListing = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ListingServices.deleteListing(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Listing deleted successfully',
    data: result,
  });
});

const updateProfileDetails = catchAsync(async (req, res) => {
  const result = await ListingServices.updateProfileDetails(
    req.user.id,
    req.body.profileDetails,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile details updated successfully',
    data: result,
  });
});

const addToGallery = catchAsync(async (req, res) => {
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    throw new AppError(400, 'No images uploaded');
  }

  const imageFiles = req.files as Express.Multer.File[];
  const uploadPromises = imageFiles.map(async (file) => {
    const { url } = await fileUploader.uploadToCloudinary(file);
    return url;
  });
  const imageUrls = await Promise.all(uploadPromises);

  const result = await ListingServices.addToGallery(req.user.id, imageUrls);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Images added to gallery successfully',
    data: result,
  });
});

const getGallery = catchAsync(async (req, res) => {
  const result = await ListingServices.getGallery(req.user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Gallery retrieved successfully',
    data: result,
  });
});

const removeFromGallery = catchAsync(async (req, res) => {
  // The image URL to remove comes from the request body
  const { image } = req.body;

  if (!image) {
    throw new AppError(400, 'Image URL is required to delete');
  }

  const result = await ListingServices.removeFromGallery(req.user.id, image);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Image removed from gallery',
    data: result,
  });
});

const updateAboutMe = catchAsync(async (req, res) => {
  const { about } = req.body;
  const userId = req.user.id;

  const result = await ListingServices.updateAboutMe(userId, about);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'About me updated successfully',
    data: result,
  });
});

export const ListingControllers = {
  createListing,
  getMyListings,
  updateListing,
  deleteListing,
  updateProfileDetails,
  addToGallery,
  getGallery,
  removeFromGallery,
  updateAboutMe,
};
