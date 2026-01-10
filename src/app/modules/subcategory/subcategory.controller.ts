import { Request, Response } from 'express';
import { SubcategoryServices } from './subcategory.service';

const createSubcategory = async (req: Request, res: Response) => {
  try {
    const result = await SubcategoryServices.createSubcategoryIntoDB(req.body);

    res.status(200).json({
      success: true,
      message: 'Subcategory created successfully',
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create subcategory',
      error: err,
    });
  }
};

const getAllSubcategories = async (req: Request, res: Response) => {
  try {
    const result = await SubcategoryServices.getAllSubcategoriesFromDB();

    res.status(200).json({
      success: true,
      message: 'Subcategories retrieved successfully',
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subcategories',
      error: err,
    });
  }
};

const getSubcategoriesByCategoryId = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const result = await SubcategoryServices.getSubcategoriesByCategoryIdFromDB(
      categoryId as string,
    );

    res.status(200).json({
      success: true,
      message: 'Subcategories retrieved successfully',
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subcategories',
      error: err,
    });
  }
};

const deleteSubcategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await SubcategoryServices.deleteSubcategoryFromDB(
      id as string,
    );

    res.status(200).json({
      success: true,
      message: 'Subcategory deleted successfully',
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete subcategory',
      error: err,
    });
  }
};

export const SubcategoryControllers = {
  createSubcategory,
  getAllSubcategories,
  getSubcategoriesByCategoryId,
  deleteSubcategory,
};
