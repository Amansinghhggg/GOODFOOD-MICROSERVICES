import express from "express"
import isAuth from "../middleware/isAuth.js";
import { acceptOrder, addRiderProfile, fetchMyCurrentOrder, fetchMyProfile, fetchRiderTotalEarnings, todayRiderEarnings, toggleAvailability, updateOrderStatus, verifyOtp } from "../controller/rider.js";
import uploadFile from "../middleware/multer.js";
const router = express.Router();

router.get("/myprofile",isAuth,fetchMyProfile);
router.patch("/toggle",isAuth,toggleAvailability);
router.post("/create",isAuth,uploadFile ,addRiderProfile);
router.post("/accept/:orderId",isAuth,acceptOrder);
router.get("/order/current",isAuth,fetchMyCurrentOrder);
router.put("/order/update/:orderId",isAuth,updateOrderStatus);
router.post("/order/verify/otp/:orderId",isAuth,verifyOtp);
router.get("/today/earnings/:id",isAuth,todayRiderEarnings);
router.get("/total/earnings/:id",isAuth,fetchRiderTotalEarnings);

export default router;