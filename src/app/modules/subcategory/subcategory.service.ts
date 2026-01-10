import { ISubcategory } from './subcategory.interface';
import { Subcategory } from './subcategory.model';

const createSubcategoryIntoDB = async (payload: ISubcategory) => {
  const result = await Subcategory.create(payload);
  return result;
};

const getAllSubcategoriesFromDB = async () => {
  // .populate('categoryId') will replace the ID with the actual Category data
  const result = await Subcategory.find({ isActive: true }).populate(
    'categoryId',
  );
  return result;
};

const getSubcategoriesByCategoryIdFromDB = async (categoryId: string) => {
  const result = await Subcategory.find({ categoryId: categoryId }).populate(
    'categoryId',
  );
  return result;
};

const deleteSubcategoryFromDB = async (id: string) => {
  const result = await Subcategory.findByIdAndDelete(id);
  return result;
};

export const SubcategoryServices = {
  createSubcategoryIntoDB,
  getAllSubcategoriesFromDB,
  getSubcategoriesByCategoryIdFromDB,
  deleteSubcategoryFromDB,
};
