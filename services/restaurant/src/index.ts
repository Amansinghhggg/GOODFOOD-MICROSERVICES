import express from "express";
import connectDB from "./config/db.js";
import restaurantRoutes from "./Routes/restaurant.js";
import menuItemRoutes from "./Routes/menuItems.js";
import cartRoutes from "./Routes/cart.js";
import addressRoutes from "./Routes/address.js";
import orderRoutes from "./Routes/order.js";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
import dotenv from "dotenv";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startPaymentConsumer } from "./config/payment.consumer.js";
dotenv.config({ path: './src/.env' });
connectRabbitMQ().then(() => {
    startPaymentConsumer();
}).catch((error) => {
    console.error('Failed to connect to RabbitMQ:', error);
    process.exit(1); // Exit the application if RabbitMQ connection fails
});
const port = process.env.PORT || 3001;
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/api/restaurant",restaurantRoutes);
app.use("/api/menu",menuItemRoutes);
app.use("/api/cart",cartRoutes);
app.use("/api/address",addressRoutes);
app.use("/api/order",orderRoutes);
    app.listen(port, () => {
        connectDB();
        console.log(`Restaurant service is running on port ${port}`);
    });