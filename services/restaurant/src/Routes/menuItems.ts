import express from 'express';
const router = express.Router();
import { addMenuItem,getAllMenuItems,deleteMenuItem,isAvailableMenuItem,editMenuItem } from '../controller/menuItem.js';
import isAuth, { isOwner } from '../middleware/isAuth.js';
import uploadFile from '../middleware/multer.js';
router.post('/new',isAuth,isOwner,uploadFile,addMenuItem);
router.get('/all/:id',isAuth,getAllMenuItems)
router.delete('/delete/:id',isAuth,isOwner,deleteMenuItem)
router.put('/edit/:id',isAuth,isOwner,uploadFile,editMenuItem)
router.put('/available/:id',isAuth,isOwner,isAvailableMenuItem)
export default router;