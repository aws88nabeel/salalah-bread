import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { orders, orderItems } from '../db/schema.js';
import { requireAdmin } from '../middleware/auth.js';
import { eq, desc, sql } from 'drizzle-orm';

const router = Router();

router.get('/orders', requireAdmin, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const query = db.select().from(orders).orderBy(desc(orders.createdAt));
    if (status) {
      const filtered = await db.select().from(orders).where(eq(orders.status, status)).orderBy(desc(orders.createdAt));
      return res.json(filtered);
    }
    const allOrders = await query;
    res.json(allOrders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/orders/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, req.params.id)).limit(1);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.patch('/orders/:id/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'baking', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const [order] = await db.update(orders).set({
      status,
      updatedAt: sql`now()`,
    }).where(eq(orders.id, req.params.id)).returning();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

router.get('/stats', requireAdmin, async (req: Request, res: Response) => {
  try {
    const totalOrders = await db.execute(
      sql`SELECT COUNT(*)::int AS count FROM orders`
    );
    const todayOrders = await db.execute(
      sql`SELECT COUNT(*)::int AS count FROM orders WHERE delivery_date = CURRENT_DATE`
    );
    const revenue = await db.execute(
      sql`SELECT COALESCE(SUM(total_amount::numeric), 0) AS total FROM orders WHERE status != 'cancelled'`
    );
    res.json({
      totalOrders: Number(totalOrders.rows?.[0]?.count ?? 0),
      todayOrders: Number(todayOrders.rows?.[0]?.count ?? 0),
      totalRevenue: Number(revenue.rows?.[0]?.total ?? 0),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
