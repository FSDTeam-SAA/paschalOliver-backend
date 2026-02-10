import { v2 as cloudinary } from 'cloudinary';
import config from '../config';

cloudinary.config({
  cloud_name: config.cloudinary.name as string,
  api_key: config.cloudinary.apiKey as string,
  api_secret: config.cloudinary.apiSecret as string,
});

export const deleteFromCloudinary = async (fileUrl: string): Promise<void> => {
  try {
    if (!fileUrl) return;

    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
    const match = fileUrl.match(regex);

    if (match && match[1]) {
      const publicId = match[1];

      // Delete the file
      await cloudinary.uploader.destroy(publicId);
      console.log(`Deleted old image from Cloudinary: ${publicId}`);
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};
