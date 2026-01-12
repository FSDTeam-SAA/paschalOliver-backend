import { IProfessional } from './professional.interface';
import { Professional } from './professional.model';

const updateProfessionalProfile = async (
  userId: string,
  payload: Partial<IProfessional>,
) => {
  const result = await Professional.findOneAndUpdate(
    { user: userId }, // Find by User ID
    payload,
    { new: true, upsert: true }, // Create if not found, return updated doc
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
