import axios from 'axios';
import tryCatch from '../middleware/trycatch.js';
import { Request, Response } from 'express';

const reverseGeocode = tryCatch(async (req: Request, res: Response) => {
    const lat = String(req.query.lat || '');
    const lon = String(req.query.lon || '');
    if (!lat || !lon) return res.status(400).json({ message: 'lat and lon are required' });

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&format=jsonv2`;
    const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'GOODFOOD/1.0 (+https://example.com)' },
        timeout: 10000,
    });
    res.status(200).json({ data });
});

export { reverseGeocode };
