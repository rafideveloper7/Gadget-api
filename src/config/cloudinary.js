import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import streamifier from 'streamifier';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Memory storage for multer
const storage = multer.memoryStorage();

// Multer upload instances
export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export const uploadMultiple = upload.array('images', 5);

// Aliases for different routes (for compatibility)
export const uploadProductImage = upload;
export const uploadProductImages = uploadMultiple;
export const uploadCategoryImage = upload;
export const uploadBlogImage = upload;

// Middleware to upload single image to Cloudinary
export const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) return next();
    
    const stream = streamifier.createReadStream(req.file.buffer);
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'gadgets/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
      },
      (error, result) => {
        if (error) {
          return next(error);
        }
        req.file.path = result.secure_url;
        req.file.cloudinaryId = result.public_id;
        next();
      }
    );
    
    stream.pipe(uploadStream);
  } catch (error) {
    next(error);
  }
};

// Middleware to upload multiple images to Cloudinary
export const uploadMultipleToCloudinary = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return next();
    
    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const stream = streamifier.createReadStream(file.buffer);
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'gadgets/products',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{ width: 800, height: 800, crop: 'limit' }]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.pipe(uploadStream);
      });
    });
    
    const imageUrls = await Promise.all(uploadPromises);
    req.imageUrls = imageUrls;
    next();
  } catch (error) {
    next(error);
  }
};

// Export cloudinary instance for other files
export default cloudinary;