import { IAddress } from './address.interface';
import { Address } from './address.model';

const createAddress = async (userId: string, payload: IAddress) => {
  // If the new address is set as default, unset previous default addresses for this user
  if (payload.isDefault) {
    await Address.updateMany({ user: userId }, { isDefault: false });
  }

  const result = await Address.create({ ...payload, user: userId });
  return result;
};

const getAddresses = async (userId: string) => {
  const result = await Address.find({ user: userId }).sort({ createdAt: -1 });
  return result;
};

const updateAddress = async (
  userId: string,
  addressId: string,
  payload: Partial<IAddress>,
) => {
  // If setting as default, unset others first
  if (payload.isDefault) {
    await Address.updateMany({ user: userId }, { isDefault: false });
  }

  const result = await Address.findOneAndUpdate(
    { _id: addressId, user: userId }, // Ensure user owns the address
    payload,
    { new: true },
  );
  return result;
};

const deleteAddress = async (userId: string, addressId: string) => {
  const result = await Address.findOneAndDelete({
    _id: addressId,
    user: userId,
  });
  return result;
};

export const AddressServices = {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
};
