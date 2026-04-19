const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  let retries = 3; // Reduced for faster dev fallback
  while (retries > 0) {
    try {
      console.log(`📡 Attempting to connect to MongoDB... (${retries} attempts left)`);
      const conn = await mongoose.connect(MONGODB_URI, options);
      console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
      return true;
    } catch (err) {
      console.error(`❌ MongoDB connection error: ${err.message}`);
      retries -= 1;
      if (retries === 0) {
        console.warn('⚠️ PORTAL BLOCKED: Could Not Reach MongoDB Atlas.');
        console.warn('📡 PROCEEDING IN LOCAL LEDGER MODE (Backup Storage)');
        return false;
      }
      console.log('⏳ Retrying in 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};

module.exports = connectDB;
