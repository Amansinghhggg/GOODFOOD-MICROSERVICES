import { connectDB } from "../config/db.js";

export const getRestaurantCollection = async () => {
    const db = await connectDB('goodfood-restaurant');
    return db.collection('restaurants');
}

export const getRiderCollection = async () => {
    const db = await connectDB('goodfood-riders');
    return db.collection('riders');
}
