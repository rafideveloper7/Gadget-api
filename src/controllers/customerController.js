import Customer from '../models/Customer.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

// @desc    Get customer profile
// @route   GET /api/customers/profile
// @access  Private
export const getCustomerProfile = async (req, res) => {
  try {
    let customer = await Customer.findOne({ user: req.user._id })
      .populate('user', 'name email phone')
      .populate('wishlist', 'name price discountPrice images rating')
      .populate({
        path: 'orderHistory',
        options: { sort: { createdAt: -1 }, limit: 10 }
      });

    if (!customer) {
      // Create customer profile if doesn't exist
      customer = await Customer.create({
        user: req.user._id,
        wishlist: [],
        orderHistory: []
      });
    }

    res.json({
      success: true,
      customer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update customer address
// @route   PUT /api/customers/address
// @access  Private
export const updateAddress = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { user: req.user._id },
      { address: req.body },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Address updated successfully',
      address: customer.address
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add to wishlist
// @route   POST /api/customers/wishlist/:productId
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { user: req.user._id },
      { $addToSet: { wishlist: req.params.productId } },
      { new: true, upsert: true }
    ).populate('wishlist', 'name price images rating');

    res.json({
      success: true,
      message: 'Added to wishlist',
      wishlist: customer.wishlist
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove from wishlist
// @route   DELETE /api/customers/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { wishlist: req.params.productId } },
      { new: true }
    ).populate('wishlist', 'name price images rating');

    res.json({
      success: true,
      message: 'Removed from wishlist',
      wishlist: customer.wishlist
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all customers (Admin)
// @route   GET /api/customers
// @access  Admin
export const getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let filter = {};
    if (search) {
      filter.$or = [
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(filter)
      .populate('user', 'name email phone createdAt')
      .populate('orderHistory')
      .skip(skip)
      .limit(limit);

    const total = await Customer.countDocuments(filter);

    // Add order count and total spent
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({ customer: customer.user._id });
        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
        return {
          ...customer.toObject(),
          orderCount: orders.length,
          totalSpent
        };
      })
    );

    res.json({
      success: true,
      customers: customersWithStats,
      page,
      totalPages: Math.ceil(total / limit),
      totalCustomers: total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer by ID (Admin)
// @route   GET /api/customers/:id
// @access  Admin
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('user', 'name email phone createdAt')
      .populate('wishlist', 'name price images')
      .populate({
        path: 'orderHistory',
        populate: { path: 'items.product', select: 'name images' }
      });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const orders = await Order.find({ customer: customer.user._id });
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

    res.json({
      success: true,
      customer: {
        ...customer.toObject(),
        totalSpent
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};