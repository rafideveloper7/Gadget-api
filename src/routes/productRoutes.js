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
  uploadProductImage,
  uploadProductImages,
} from "../config/cloudinary.js";

const router = express.Router();

router
  .route("/")
  .get(getProducts)
  .post(protect, adminOnly, uploadProductImage.single("image"), createProduct);

router
  .route("/:id")
  .get(getProductById)
  .put(protect, adminOnly, uploadProductImage.single("image"), updateProduct)
  .delete(protect, adminOnly, deleteProduct);

// For multiple images
router.post(
  "/:id/images",
  protect,
  adminOnly,
  uploadProductImages,
  addProductImages,
);

export default router;
