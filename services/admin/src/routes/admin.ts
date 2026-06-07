import express from 'express';
import isAuth, { isAdmin } from '../middleware/authentication.js';
import { getPendingRestaurants, getPendingRiders, verifyRestaurant, verifyRider } from '../controllers/admin.js';
const router = express.Router();

router.get('/admin/pendingrestaurants', isAuth,isAdmin,getPendingRestaurants);
router.get('/admin/pendingriders', isAuth,isAdmin,getPendingRiders);
router.patch('/admin/verifyrestaurant/:id', isAuth,isAdmin, verifyRestaurant);
router.patch('/admin/verifyrider/:id', isAuth,isAdmin, verifyRider);




export default router;