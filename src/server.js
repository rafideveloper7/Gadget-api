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
  // Ensure database is connected
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  return app(req, res);
}

// Only listen if not on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
    Server running on port ${PORT}
    Environment: ${process.env.NODE_ENV || 'development'}
    API: http://localhost:${PORT}/api
    `);
  });
}