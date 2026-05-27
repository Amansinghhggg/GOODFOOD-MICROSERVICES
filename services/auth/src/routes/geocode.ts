import express from 'express';
import { reverseGeocode } from '../contoller/geocode.js';

const router = express.Router();

router.get('/reverse', reverseGeocode);

export default router;
