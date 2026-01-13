import { Professional } from './professional.model';
import { IProfessional } from './professional.interface';

const updateProfessionalProfile = async (
  userId: string,
  payload: Partial<IProfessional>,
) => {
  const result = await Professional.findOneAndUpdate(
    { user: userId },
    payload,
    {
      new: true,
      upsert: true,
      runValidators: true,
    },
  );
  return result;
};

const getProfessionalProfile = async (userId: string) => {
  const result = await Professional.findOne({ user: userId }).populate('user');
  return result;
};

export const ProfessionalServices = {
  updateProfessionalProfile,
  getProfessionalProfile,
};
