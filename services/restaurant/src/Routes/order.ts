import express from "express";
import isAuth from "../middleware/isAuth.js";
import { createOrder, fetchOrders } from "../controller/order.js";
const router = express.Router();

router.post("/new",isAuth,createOrder);
router.get("/payment",fetchOrders);

export default router;