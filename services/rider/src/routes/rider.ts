import express from "express"
import isAuth from "../middleware/isAuth.js";
import { addRiderProfile, fetchMyProfile, toggleAvailability } from "../controller/rider.js";
import uploadFile from "../middleware/multer.js";
const router = express.Router();

router.get("/myprofile",isAuth,fetchMyProfile);
router.patch("/toggle",isAuth,toggleAvailability);
router.post("/create",isAuth,uploadFile ,addRiderProfile);




export default router;