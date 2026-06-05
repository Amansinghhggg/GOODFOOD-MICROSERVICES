import axios from 'axios';
import tryCatch from '../middleware/trycatch.js';
import { Request, Response } from 'express';

const reverseGeocodeCache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

const reverseGeocode = tryCatch(async (req: Request, res: Response) => {
    const lat = String(req.query.lat || '');
    const lon = String(req.query.lon || '');
    if (!lat || !lon) return res.status(400).json({ message: 'lat and lon are required' });

    const cacheKey = `${lat},${lon}`;
    const cached = reverseGeocodeCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        return res.status(200).json({ data: cached.data, cached: true });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&format=jsonv2`;
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': `GOODFOOD/1.0 (${process.env.GEOCODE_CONTACT_EMAIL ?? 'support@goodfood.local'})`,
                'Accept-Language': 'en',
            },
            timeout: 10000,
        });

        reverseGeocodeCache.set(cacheKey, {
            data,
            expiresAt: Date.now() + CACHE_TTL_MS,
        });

        res.status(200).json({ data });
    } catch (error: any) {
        const status = error?.response?.status;
        if (status === 429) {
            return res.status(429).json({
                message: 'Reverse geocoding is rate limited. Please try again shortly.',
                data: cached?.data ?? null,
            });
        }

        console.error('Reverse geocode request failed', status, error?.message ?? error);
        return res.status(502).json({ message: 'Unable to resolve location at the moment.' });
    }
});

export { reverseGeocode };
