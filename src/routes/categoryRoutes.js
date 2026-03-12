import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { uploadCategoryImage } from '../config/cloudinary.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, adminOnly, uploadCategoryImage.single('image'), createCategory);

router.route('/:id')
  .get(getCategoryById)
  .put(protect, adminOnly, uploadCategoryImage.single('image'), updateCategory)
  .delete(protect, adminOnly, deleteCategory);

export default router;