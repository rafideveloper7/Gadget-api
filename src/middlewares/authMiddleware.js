import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

/**
 * Protect routes - verifies JWT token and attaches user/admin to request
 */
export const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    // Check if authorization header exists and starts with Bearer
    if (authHeader && authHeader.startsWith('Bearer')) {
      // Extract token (remove 'Bearer ' prefix)
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Log for debugging (remove in production)
      console.log('Decoded token:', { id: decoded.id, isAdmin: decoded.isAdmin });

      // Try to find as regular user first
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        req.userType = 'user';
        return next();
      }

      // Try to find as admin in 'admins' collection (via model)
      const admin = await Admin.findById(decoded.id).select('-password');
      if (admin) {
        req.admin = admin;
        req.userType = 'admin';
        return next();
      }

      // If not found in model, try direct collection access (for backward compatibility)
      try {
        const db = mongoose.connection.db;
        const adminFromDb = await db.collection('admin').findOne({
          _id: new mongoose.Types.ObjectId(decoded.id)
        });
        
        if (adminFromDb) {
          // Remove password from response
          delete adminFromDb.password;
          req.admin = adminFromDb;
          req.userType = 'admin';
          return next();
        }
      } catch (dbError) {
        console.error('Database lookup error:', dbError.message);
      }

      // If we get here, no user or admin found
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      });

    } catch (jwtError) {
      console.error('JWT verification error:', jwtError.message);
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, invalid token'
        });
      }
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, token expired'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
};

/**
 * Admin only middleware - ensures the authenticated user is an admin
 */
export const adminOnly = (req, res, next) => {
  // Check if admin exists on request (from protect middleware)
  if (!req.admin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  // Optional: Check for superadmin role if needed
  if (req.admin.role === 'superadmin') {
    req.isSuperAdmin = true;
  }

  next();
};

/**
 * Super admin only middleware - ensures user is superadmin
 */
export const superAdminOnly = (req, res, next) => {
  if (!req.admin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required'
    });
  }

  next();
};

/**
 * Optional auth - doesn't require token but attaches user if present
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Try to find user
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
        }
        
        // Try to find admin
        const admin = await Admin.findById(decoded.id).select('-password');
        if (admin) {
          req.admin = admin;
        }
      } catch (error) {
        // Silently fail for optional auth
        console.log('Optional auth failed:', error.message);
      }
    }
    
    next();
  } catch (error) {
    // Continue even if auth fails
    next();
  }
};

export default {
  protect,
  adminOnly,
  superAdminOnly,
  optionalAuth
};
