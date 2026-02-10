import { Request, Response } from 'express';
import { SubcategoryServices } from './subcategory.service';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { fileUploader } from '../../helper/fileUploder';
import sendResponse from '../../utils/sendResponse';

const createSubcategory = catchAsync(async (req: Request, res: Response) => {
  if (req.file) {
    const { url } = await fileUploader.uploadToCloudinary(req.file);
    req.body.image = url;
  }

  const result = await SubcategoryServices.createSubcategory(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subcategory created successfully',
    data: result,
  });
});

const getAllSubcategories = catchAsync(async (req: Request, res: Response) => {
  const result = await SubcategoryServices.getAllSubcategories();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subcategories retrieved successfully',
    data: result,
  });
});

const getSubcategoriesByCategoryId = catchAsync(
  async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const result = await SubcategoryServices.getSubcategoriesByCategoryId(
      categoryId as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Subcategories retrieved successfully',
      data: result,
    });
  },
);

const deleteSubcategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubcategoryServices.deleteSubcategory(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subcategory deleted successfully',
    data: result,
  });
});

export const SubcategoryControllers = {
  createSubcategory,
  getAllSubcategories,
  getSubcategoriesByCategoryId,
  deleteSubcategory,
};
