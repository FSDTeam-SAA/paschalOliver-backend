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

export const ListingControllers = {
  createListing,
  getMyListings,
  updateListing,
  deleteListing,
};
