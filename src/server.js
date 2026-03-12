import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// app.listen(PORT, () => {
//   console.log(`
//     Server running on port ${PORT}
//     Environment: ${process.env.NODE_ENV || 'development'}
//     API: http://localhost:${PORT}/api
//   `);
// });

export default app;