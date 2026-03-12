export const logger = {
  info: (message) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
  },
  error: (message, error) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
    if (error) console.error(error);
  },
  success: (message) => {
    console.log(`[SUCCESS] ${new Date().toISOString()}: ${message}`);
  },
  warn: (message) => {
    console.log(`[WARN] ${new Date().toISOString()}: ${message}`);
  }
};