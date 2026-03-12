import express from 'express';
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
} from '../controllers/blogController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { uploadBlogImage } from '../config/cloudinary.js';

const router = express.Router();

router.route('/')
  .get(getBlogs)
  .post(protect, adminOnly, uploadBlogImage.single('image'), createBlog);

router.route('/:id')
  .get(getBlogById)
  .put(protect, adminOnly, uploadBlogImage.single('image'), updateBlog)
  .delete(protect, adminOnly, deleteBlog);

export default router;