import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Blog from '../models/Blog.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
export const getDashboardStats = async (req, res) => {
  try {
    // Basic counts
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const totalOrders = await Order.countDocuments();
    const totalBlogs = await Blog.countDocuments();

    // Order statistics
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'processing' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

    // Revenue
    const paidOrders = await Order.find({ paymentStatus: 'paid' });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);

    // Today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.find({
      createdAt: { $gte: today },
      paymentStatus: 'paid'
    });
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

    // Monthly revenue for chart
    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      }
    ]);

    // Low stock products
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .select('name stock price images')
      .limit(10);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('customer', 'name email')
      .sort('-createdAt')
      .limit(10);

    // Category distribution
    const categoryDistribution = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: {
        overview: {
          totalProducts,
          totalCategories,
          totalCustomers,
          totalOrders,
          totalBlogs,
          totalRevenue,
          todayRevenue
        },
        orders: {
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
          total: totalOrders
        },
        charts: {
          monthlyRevenue,
          categoryDistribution
        },
        insights: {
          topProducts,
          lowStockProducts,
          recentOrders
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get sales report
// @route   GET /api/admin/reports/sales
// @access  Admin
export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, period = 'daily' } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    let groupBy;
    switch (period) {
      case 'daily':
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'monthly':
        groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
      case 'yearly':
        groupBy = { $dateToString: { format: '%Y', date: '$createdAt' } };
        break;
      default:
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }

    const salesData = await Order.aggregate([
      { $match: { paymentStatus: 'paid', ...dateFilter } },
      {
        $group: {
          _id: groupBy,
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
          items: { $sum: { $size: '$items' } }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      success: true,
      report: {
        period,
        startDate: startDate || 'All time',
        endDate: endDate || 'Present',
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue
        },
        data: salesData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get inventory report
// @route   GET /api/admin/reports/inventory
// @access  Admin
export const getInventoryReport = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .select('name brand price stock category isFeatured');

    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const outOfStock = products.filter(p => p.stock === 0).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length;
    const inStock = products.filter(p => p.stock >= 10).length;

    const categoryBreakdown = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          products: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      }
    ]);

    res.json({
      success: true,
      report: {
        summary: {
          totalProducts: products.length,
          totalValue,
          inStock,
          lowStock,
          outOfStock
        },
        products: products.filter(p => p.stock < 10).sort((a, b) => a.stock - b.stock),
        categoryBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};