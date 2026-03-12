import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import mongoose from 'mongoose';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Export for Vercel serverless
export default async function handler(req, res) {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.log('🔄 Database not connected, connecting...');
      await connectDB();
    }
    
    console.log(`📨 Request: ${req.method} ${req.url}`);
    
    // Handle the request
    return app(req, res);
  } catch (error) {
    console.error('❌ Serverless function error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Only listen if not on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
✅ Server running on port ${PORT}
📝 Environment: ${process.env.NODE_ENV || 'development'}
🌐 API: http://localhost:${PORT}/api
    `);
  });
}