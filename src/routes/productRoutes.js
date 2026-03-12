import express from "express";
import {
  addProductImages,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import {
  upload,
  uploadMultiple,
  uploadToCloudinary,
  uploadMultipleToCloudinary
} from "../config/cloudinary.js";

const router = express.Router();

// Single image upload route
router
  .route("/")
  .get(getProducts)
  .post(
    protect, 
    adminOnly, 
    upload.single("image"), 
    uploadToCloudinary, 
    createProduct
  );

// Single image update route
router
  .route("/:id")
  .get(getProductById)
  .put(
    protect, 
    adminOnly, 
    upload.single("image"), 
    uploadToCloudinary, 
    updateProduct
  )
  .delete(protect, adminOnly, deleteProduct);

// Multiple images upload route
router.post(
  "/:id/images",
  protect,
  adminOnly,
  uploadMultiple,
  uploadMultipleToCloudinary,
  addProductImages
);

export default router;