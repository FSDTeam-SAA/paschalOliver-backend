import { deleteFromCloudinary } from '../../helper/deleteImage';
import { IUser } from './user.interface';
import { User } from './user.model';

const getUserProfile = async (userId: string) => {
  const result = await User.findById(userId);
  return result;
};

const updatePersonalDetails = async (id: string, payload: Partial<IUser>) => {
  if (payload.image) {
    const currentUser = await User.findById(id);

    if (currentUser?.image) {
      await deleteFromCloudinary(currentUser.image);
    }
  }

  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const updateUserLanguage = async (userId: string, language: string) => {
  const result = await User.findByIdAndUpdate(
    userId,
    { language },
    { new: true, runValidators: true },
  );
  return result;
};

export const UserServices = {
  getUserProfile,
  updatePersonalDetails,
  updateUserLanguage,
};

// const getUserById = async (id: string) => {
//   const result = await User.findById(id);
//   if (!result) {
//     throw new AppError(404, 'User not found');
//   }
//   return result;
// };

// const getAllUser = async (params: any, options: IOption) => {
//   const { page, limit, skip, sortBy, sortOrder } = pagination(options);
//   const { searchTerm, ...filterData } = params;

//   const andCondition: any[] = [];
//   const userSearchableFields = ['name', 'email', 'role'];

//   if (searchTerm) {
//     andCondition.push({
//       $or: userSearchableFields.map((field) => ({
//         [field]: { $regex: searchTerm, $options: 'i' },
//       })),
//     });
//   }

//   if (Object.keys(filterData).length) {
//     andCondition.push({
//       $and: Object.entries(filterData).map(([field, value]) => ({
//         [field]: value,
//       })),
//     });
//   }

//   const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};

//   const result = await User.find(whereCondition)
//     .skip(skip)
//     .limit(limit)
//     .sort({ [sortBy]: sortOrder } as any);

//   if (!result) {
//     throw new AppError(404, 'Users not found');
//   }

//   const total = await User.countDocuments(whereCondition);

//   return {
//     data: result,
//     meta: {
//       total,
//       page,
//       limit,
//     },
//   };
// };

// const updateUserById = async (
//   id: string,
//   payload: IUser,
//   file?: Express.Multer.File,
// ) => {
//   const user = await User.findById(id);
//   if (!user) {
//     throw new AppError(404, 'User not found');
//   }
//   if (file) {
//     const uploadProfile = await fileUploader.uploadToCloudinary(file);
//     if (!uploadProfile?.url) {
//       throw new AppError(400, 'Failed to upload profile image');
//     }
//     payload.profileImage = uploadProfile.url;
//   }
//   const result = await User.findByIdAndUpdate(id, payload, { new: true });
//   if (!result) {
//     throw new AppError(404, 'User not found');
//   }
//   return result;
// };

// const deleteUserById = async (id: string) => {
//   const result = await User.findByIdAndDelete(id);
//   if (!result) {
//     throw new AppError(404, 'User not found');
//   }
//   return result;
// };

// const profile = async (id: string) => {
//   const result = await User.findById(id);
//   if (!result) {
//     throw new AppError(404, 'User not found');
//   }
//   return result;
// };
