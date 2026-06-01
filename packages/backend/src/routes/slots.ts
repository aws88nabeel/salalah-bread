import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { timeSlots, orders } from '../db/schema.js';
import { requireAdmin } from '../middleware/auth.js';
import { eq, sql } from 'drizzle-orm';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
    const slots = await db.select().from(timeSlots).where(eq(timeSlots.isActive, true));
    const results = await Promise.all(slots.map(async (slot) => {
      const countResult = await db.execute(
        sql`SELECT COUNT(*)::int AS count FROM orders WHERE slot_id = ${slot.id} AND delivery_date = ${date} AND status != 'cancelled'`
      );
      const orderCount = countResult.rows?.[0]?.count ?? 0;
      return {
        ...slot,
        remainingCapacity: Math.max(0, slot.maxOrders - Number(orderCount)),
      };
    }));
    res.json(results);
  } catch (err) {
    console.error('Slots error:', err);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { labelAr, labelEn, slotStart, slotEnd, maxOrders } = req.body;
    const [slot] = await db.insert(timeSlots).values({
      labelAr, labelEn, slotStart, slotEnd, maxOrders,
    }).returning();
    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create slot' });
  }
});

router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const [slot] = await db.update(timeSlots).set(req.body).where(eq(timeSlots.id, req.params.id)).returning();
    res.json(slot);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update slot' });
  }
});

export default router;
