import express from "express";
import isAuth from "../middleware/isAuth.js";
import { addToCart, clearCart, fetchCart, removeFromCart } from "../controller/cart.js";
const router = express.Router();

router.post("/add",isAuth,addToCart);
router.get("/all",isAuth,fetchCart);
router.delete("/clear",isAuth,clearCart);
router.put("/remove",isAuth,removeFromCart);

export default router;