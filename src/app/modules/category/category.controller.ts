import { Request, Response } from 'express';
import { CategoryServices } from './category.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { fileUploader } from '../../helper/fileUploder';

const createCategory = catchAsync(async (req: Request, res: Response) => {
  if (req.file) {
    const { url } = await fileUploader.uploadToCloudinary(req.file);
    req.body.image = url;
  }

  const result = await CategoryServices.createCategory(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category created successfully',
    data: result,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.getAllCategories();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Categories retrieved successfully',
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CategoryServices.deleteCategory(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category deleted successfully',
    data: result,
  });
});

export const CategoryControllers = {
  createCategory,
  getAllCategories,
  deleteCategory,
};
