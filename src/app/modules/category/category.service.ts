import { ICategory } from './category.interface';
import { Category } from './category.model';

const createCategory = async (payload: ICategory) => {
  const result = await Category.create(payload);
  return result;
};

const getAllCategories = async () => {
  const result = await Category.find({ isActive: true });
  return result;
};

const deleteCategory = async (id: string) => {
  const result = await Category.findByIdAndDelete(id);
  return result;
};

export const CategoryServices = {
  createCategory,
  getAllCategories,
  deleteCategory,
};
