import express from 'express';
import {
  getDashboardStats,
  getSalesReport,
  getInventoryReport
} from '../controllers/dashboardController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, adminOnly, getDashboardStats);
router.get('/reports/sales', protect, adminOnly, getSalesReport);
router.get('/reports/inventory', protect, adminOnly, getInventoryReport);

export default router;