import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary (in case it's not configured elsewhere)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return false;
    
    // Extract public_id from URL
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/public_id.jpg
    const urlParts = imageUrl.split('/');
    const publicIdWithExt = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExt.split('.')[0];
    const folder = urlParts[urlParts.length - 2];
    
    const fullPublicId = folder === 'upload' ? publicId : `${folder}/${publicId}`;
    
    const result = await cloudinary.uploader.destroy(fullPublicId);
    console.log('✅ Deleted from Cloudinary:', result);
    return result;
  } catch (error) {
    console.error('❌ Error deleting from Cloudinary:', error);
    return false;
  }
};