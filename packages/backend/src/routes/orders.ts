import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { orders, orderItems, menuItems, deliveryZones, timeSlots } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { eq, sql, inArray } from 'drizzle-orm';

const router = Router();

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      deliveryLat, deliveryLng, deliveryAddress, slotId, deliveryDate, items, notes,
    } = req.body;

    if (!deliveryLat || !deliveryLng || !slotId || !deliveryDate || !items?.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [zone] = await db.select().from(deliveryZones).where(eq(deliveryZones.name, 'Salalah')).limit(1);

    const countResult = await db.execute(
      sql`SELECT COUNT(*)::int AS count FROM orders WHERE slot_id = ${slotId} AND delivery_date = ${deliveryDate} AND status != 'cancelled'`
    );
    const currentCount = Number(countResult.rows?.[0]?.count ?? 0);
    const [slot] = await db.select().from(timeSlots).where(eq(timeSlots.id, slotId)).limit(1);
    if (slot && currentCount >= slot.maxOrders) {
      return res.status(400).json({ error: 'This time slot is full' });
    }

    const itemIds = items.map((i: any) => i.menuItemId);
    const menuRows = await db.select().from(menuItems).where(inArray(menuItems.id, itemIds));
    const menuMap = new Map(menuRows.map(m => [m.id, m]));

    let totalAmount = 0;
    const orderItemsData = items.map((item: any) => {
      const menuItem = menuMap.get(item.menuItemId);
      if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);
      const unitPrice = Number(menuItem.price);
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: unitPrice.toFixed(3),
        subtotal: subtotal.toFixed(3),
      };
    });

    const [order] = await db.insert(orders).values({
      customerId: req.user!.userId,
      customerName: req.body.customerName || '',
      customerPhone: req.user!.phone,
      deliveryLat: deliveryLat.toFixed(6),
      deliveryLng: deliveryLng.toFixed(6),
      deliveryAddress,
      deliveryZoneId: zone?.id,
      slotId,
      deliveryDate,
      notes,
      totalAmount: totalAmount.toFixed(3),
    }).returning();

    await db.insert(orderItems).values(
      orderItemsData.map(oi => ({ ...oi, orderId: order.id }))
    );

    res.status(201).json({ ...order, items: orderItemsData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userOrders = await db.select()
      .from(orders)
      .where(eq(orders.customerId, req.user!.userId))
      .orderBy(sql`created_at DESC`);
    res.json(userOrders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, req.params.id)).limit(1);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.customerId !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
