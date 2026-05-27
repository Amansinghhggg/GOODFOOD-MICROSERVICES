import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import geocodeRoutes from './routes/geocode.js';
import cors from 'cors';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/geocode', geocodeRoutes);
const port = process.env.PORT || 3000;

    app.listen(port, () => {
        connectDB();
        console.log(`Auth service is running on port ${port}`);
    });