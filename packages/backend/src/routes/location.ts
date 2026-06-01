import { Router, Request, Response } from 'express';
import { isLocationInSalalah, getSalalahZone } from '../utils/geofence.js';

const router = Router();

router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.body;
    if (lat == null || lng == null) {
      return res.status(400).json({ error: 'lat and lng required' });
    }
    const isInside = await isLocationInSalalah(Number(lat), Number(lng));
    res.json({ isDeliverable: isInside });
  } catch (err) {
    res.status(500).json({ error: 'Validation failed' });
  }
});

router.get('/zone', async (_req: Request, res: Response) => {
  try {
    const zone = await getSalalahZone();
    if (!zone) return res.status(404).json({ error: 'Delivery zone not configured' });
    res.json(zone);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch zone' });
  }
});

export default router;
