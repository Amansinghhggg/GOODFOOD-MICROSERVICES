import express from 'express';
import isAuth from '../middleware/authentication.js';
import { reverseGeocode } from '../contoller/geocode.js';

const router = express.Router();

router.get('/reverse', isAuth, reverseGeocode);

export default router;
