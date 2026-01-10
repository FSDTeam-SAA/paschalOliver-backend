import { Request, Response } from 'express';
import { CategoryServices } from './category.service';

const createCategory = async (req: Request, res: Response) => {
  try {
    const result = await CategoryServices.createCategoryIntoDB(req.body);

    res.status(200).json({
      success: true,
      message: 'Category created successfully',
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: err,
    });
  }
};

const getAllCategories = async (req: Request, res: Response) => {
  try {
    const result = await CategoryServices.getAllCategoriesFromDB();

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: err,
    });
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await CategoryServices.deleteCategoryFromDB(id as string);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: err,
    });
  }
};

export const CategoryControllers = {
  createCategory,
  getAllCategories,
  deleteCategory,
};
