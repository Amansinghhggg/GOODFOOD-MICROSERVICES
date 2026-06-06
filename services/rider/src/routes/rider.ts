import express from "express"
import isAuth from "../middleware/isAuth.js";
import { acceptOrder, addRiderProfile, fetchMyCurrentOrder, fetchMyProfile, toggleAvailability, updateOrderStatus } from "../controller/rider.js";
import uploadFile from "../middleware/multer.js";
const router = express.Router();

router.get("/myprofile",isAuth,fetchMyProfile);
router.patch("/toggle",isAuth,toggleAvailability);
router.post("/create",isAuth,uploadFile ,addRiderProfile);
router.post("/accept/:orderId",isAuth,acceptOrder);
router.get("/order/current",isAuth,fetchMyCurrentOrder);
router.put("/order/update/:orderId",isAuth,updateOrderStatus);


export default router;