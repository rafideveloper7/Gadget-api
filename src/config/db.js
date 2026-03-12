import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(` MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(` MongoDB Error: ${error.message}`);
    // Don't exit process on Vercel
    throw error; // Throw error to handle it in the API route
  }
};