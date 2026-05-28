import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './src/.env' });

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  try {
    await mongoose.connect(uri as string,{
        dbName: 'goodfood-restaurant',
    });
    console.log('🟢🟢 MongoDB connected (restaurant service) 🟢🟢');
  } catch (error) {
    console.error('🔴🔴Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;