import express from "express";
import connectDB from "./config/db.js";
import restaurantRoutes from "./Routes/restaurant.js";
import menuItemRoutes from "./Routes/menuItems.js";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
import dotenv from "dotenv";
dotenv.config({ path: './src/.env' });
const port = process.env.PORT || 3001;
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/api/restaurant",restaurantRoutes);
app.use("/api/menu",menuItemRoutes);
    app.listen(port, () => {
        connectDB();
        console.log(`Restaurant service is running on port ${port}`);
    });