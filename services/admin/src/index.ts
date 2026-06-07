import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT
app.use(cors());
app.use("/api/v1", adminRoutes);
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Admin service running on port ${PORT}`);
});