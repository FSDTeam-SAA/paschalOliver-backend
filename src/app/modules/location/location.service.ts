import { ILocation } from './location.interface';
import { Location } from './location.model';

const createLocation = async (payload: ILocation) => {
  const result = await Location.create(payload);
  return result;
};

const getAllLocations = async () => {
  const result = await Location.find();
  return result;
};

export const LocationServices = {
  createLocation,
  getAllLocations,
};
