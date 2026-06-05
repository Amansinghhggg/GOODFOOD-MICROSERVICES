import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  try {
    await mongoose.connect(uri as string,{
        dbName: 'goodfood-riders',
    });
    console.log('🟢🟢 MongoDB connected (rider service) 🟢🟢');
  } catch (error) {
    console.error('🔴🔴Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;