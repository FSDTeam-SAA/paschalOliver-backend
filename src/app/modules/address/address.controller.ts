import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AddressServices } from './address.service';

const createAddress = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await AddressServices.createAddress(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Address added successfully',
    data: result,
  });
});

const getAddresses = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await AddressServices.getAddresses(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Addresses retrieved successfully',
    data: result,
  });
});

const updateAddress = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const result = await AddressServices.updateAddress(
    userId,
    id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Address updated successfully',
    data: result,
  });
});

const deleteAddress = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  await AddressServices.deleteAddress(userId, id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Address deleted successfully',
    data: null,
  });
});

export const AddressControllers = {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
};
