const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/accentrix';
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, family: 4 });
    isConnected = true;
    console.log('📦 Connected to MongoDB');
  } catch (error) {
    console.warn(`⚠️  Could not connect to MongoDB: ${error.message}. Using in-memory fallback.`);
    isConnected = false;
  }
};

const getDbStatus = () => isConnected;

module.exports = { connectDB, getDbStatus };
