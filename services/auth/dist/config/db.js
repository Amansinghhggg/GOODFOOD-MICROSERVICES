import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    try {
        await mongoose.connect(uri, {
            dbName: 'goodfood-auth',
        });
        console.log('🟢🟢 MongoDB connected 🟢🟢');
    }
    catch (error) {
        console.error('🔴🔴Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
export default connectDB;
