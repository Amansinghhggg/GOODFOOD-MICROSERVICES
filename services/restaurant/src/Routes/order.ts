import express from "express";
import isAuth from "../middleware/isAuth.js";
import { createOrder, fetchOrders, fetchRestaurantOrders, fetchSingleOrder, getMyOrders, updateOrderStatus } from "../controller/order.js";
const router = express.Router();

router.post("/new",isAuth,createOrder);
router.get("/payment/:id",fetchOrders);
router.get("/:restaurantId",isAuth,fetchRestaurantOrders);
router.put("/:orderId",isAuth,updateOrderStatus);
router.get("/:id",isAuth,fetchSingleOrder);
router.get("/my",isAuth,getMyOrders);
export default router;