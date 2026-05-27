import { login,addUserRole,MyProfile,} from '../contoller/auth.js';
import authentication from '../middleware/authentication.js';
import express from 'express';
const router = express.Router();

router.post('/login', login);
router.put('/add/role', authentication, addUserRole);
router.get('/me', authentication, MyProfile);
export default router;