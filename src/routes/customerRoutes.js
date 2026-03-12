import express from 'express';
import {
  getCustomerProfile,
  updateAddress,
  addToWishlist,
  removeFromWishlist,
  getAllCustomers,
  getCustomerById
} from '../controllers/customerController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getCustomerProfile);
router.put('/address', protect, updateAddress);

router.post('/wishlist/:productId', protect, addToWishlist);
router.delete('/wishlist/:productId', protect, removeFromWishlist);

// Admin routes
router.get('/', protect, adminOnly, getAllCustomers);
router.get('/:id', protect, adminOnly, getCustomerById);

export default router;