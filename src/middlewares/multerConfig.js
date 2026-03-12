import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Product images storage
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'gadgets/products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: `product-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      transformation: [{ width: 800, height: 800, crop: 'limit' }]
    };
  }
});

// Blog images storage
const blogStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'gadgets/blogs',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: `blog-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      transformation: [{ width: 1200, height: 630, crop: 'limit' }]
    };
  }
});

// Category images storage
const categoryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'gadgets/categories',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: `category-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      transformation: [{ width: 500, height: 500, crop: 'limit' }]
    };
  }
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
  }
};

// Create multer instances for different routes
export const uploadProductImage = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

export const uploadBlogImage = multer({
  storage: blogStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

export const uploadCategoryImage = multer({
  storage: categoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

// For multiple images (products)
export const uploadProductImages = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
}).array('images', 5);

// For backward compatibility
export const upload = uploadProductImage;
export const uploadMultiple = uploadProductImages;