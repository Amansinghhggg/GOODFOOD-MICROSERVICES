import express from "express";
import { addAddress, deleteAddress, getMyAddresses } from "../controller/address.js";
import isAuth from "../middleware/isAuth.js";
const router = express.Router();
router.get("/all",isAuth,getMyAddresses);
router.post("/new", isAuth, addAddress);
router.delete("/:id", isAuth, deleteAddress);
export default router;