import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { Service } from './service.model';
import { Subcategory } from '../subcategory/subcategory.model';
import AppError from '../../error/appError';
import mongoose from 'mongoose';

//create service
export const createService = catchAsync(async (req: Request, res: Response) => {
  const values = req?.body?.value;
  // const values = value.value;
  //update sub category
  const subcategory = await Subcategory.findById(values.subCategoryId);
  if (!subcategory) {
    throw new Error('Subcategory not found');
  }

  const service = await Service.create(values);
  if (!service) {
    throw new Error('Service not created');
  }
  //update sub category
  subcategory.serviceId.push(service._id);
  await subcategory.save();

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Service created successfully',
    data: service,
  });
});

//get all services
export const getAllServices = catchAsync(
  async (req: Request, res: Response) => {
    const services = await Service.find();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Services retrieved successfully',
      data: services,
    });
  },
);

//get single service
export const getSingleService = catchAsync(
  async (req: Request, res: Response) => {
    const { serviceId } = req.params;
    const service = await Service.findById(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Service retrieved successfully',
      data: service,
    });
  },
);

//get all services by subcategory
export const getServicesBySubcategory = catchAsync(
  async (req: Request, res: Response) => {
    const { subcategoryId } = req.params;

    const services = await Service.find({ subCategoryId: subcategoryId });
    if (!services) {
      throw new Error('Services not found');
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Services retrieved successfully',
      data: services,
    });
  },
);

//update service
export const updateService = catchAsync(async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const values = req?.body?.value;

  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch old service inside the transaction
    const oldService = await Service.findById(serviceId).session(session);
    if (!oldService) throw new AppError(404, 'Service not found');

    // Check if subCategoryId is changing
    const subCategoryChanged =
      values.subCategoryId &&
      !oldService.subCategoryId.equals(values.subCategoryId);

    //  Update the service
    const service = await Service.findByIdAndUpdate(
      serviceId,
      values,
      { new: true, session }, // Important: attach session
    );

    //  Update subcategories if changed
    if (subCategoryChanged) {
      await Subcategory.updateOne(
        { _id: oldService.subCategoryId },
        { $pull: { serviceId: serviceId } },
        { session },
      );

      await Subcategory.updateOne(
        { _id: values.subCategoryId },
        { $push: { serviceId: serviceId } },
        { session },
      );
    }

    //  Commit transaction
    await session.commitTransaction();
    session.endSession();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Service updated successfully',
      data: service,
    });
  } catch (err) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

//delete service
export const deleteService = catchAsync(async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const service = await Service.findByIdAndDelete(serviceId);
  if (!service) {
    throw new AppError(404, 'Service not found');
  }
  //also delete from sub category
  await Subcategory.updateOne(
    { _id: service.subCategoryId },
    { $pull: { serviceId: serviceId } },
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Service deleted successfully',
    data: {
      id: service._id,
      title: service.title,
    },
  });
});
