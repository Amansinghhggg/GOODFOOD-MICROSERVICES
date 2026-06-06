import express from 'express';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import cors from "cors"
import riderRoutes from './routes/rider.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
import { startOrderReadyConsumer } from './config/orderReady.consumer.js';
dotenv.config();
await connectRabbitMQ();
startOrderReadyConsumer();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api/rider",riderRoutes);
app.listen(process.env.PORT, () => {
    console.log(`Rider service is running on port ${process.env.PORT || 3004}`);
    connectDB();
});