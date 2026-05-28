import express from "express"
import isAuth,{isOwner} from "../middleware/isAuth.js"
import {addRestaurant,fetchMyRestaurant, isOpenRestaurant,editRestaurant} from "../controller/restaurant.js"
import uploadFile from "../middleware/multer.js";
const router = express.Router();

router.post("/add",isAuth,isOwner,uploadFile,addRestaurant);
router.get("/my",isAuth,isOwner,fetchMyRestaurant)
router.put("/is-open", isAuth, isOwner, isOpenRestaurant);
router.put("/edit", isAuth, isOwner, uploadFile, editRestaurant); 
export default router;