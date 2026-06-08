import express from "express";
import isAuth from "../middleware/isAuth.js";
import { assignRiderToOrder, createOrder, fetchOrders, fetchRestaurantOrders, fetchSingleOrder, getCurrentOrderForRider, getMyOrders, updateOrderStatus, updateOrderStatusByRider, verifyotp } from "../controller/order.js";
const router = express.Router();
router.get("/customer/my",isAuth,getMyOrders);
router.post("/new",isAuth,createOrder);
router.get("/payment/:id",fetchOrders);
router.get("/:restaurantId",isAuth,fetchRestaurantOrders);
router.put("/:orderId",isAuth,updateOrderStatus);
router.get("/order/:orderId",isAuth,fetchSingleOrder);
router.put("/assign/rider",assignRiderToOrder);
router.get("/current/rider",getCurrentOrderForRider)
router.put("/update/status/:orderId",updateOrderStatusByRider);
router.post("/verify/otp/:orderId",verifyotp);
export default router;