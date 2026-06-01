import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { categories, menuItems } from '../db/schema.js';
import { requireAdmin } from '../middleware/auth.js';
import { eq, asc } from 'drizzle-orm';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
    const items = await db.select().from(menuItems).where(eq(menuItems.isActive, true));
    const menu = cats.map(cat => ({
      ...cat,
      items: items.filter(i => i.categoryId === cat.id),
    }));
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

router.get('/all', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const items = await db.select().from(menuItems);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { categoryId, nameAr, nameEn, description, price, imageUrl, maxPerOrder } = req.body;
    const [item] = await db.insert(menuItems).values({
      categoryId, nameAr, nameEn, description, price, imageUrl, maxPerOrder,
    }).returning();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const [item] = await db.update(menuItems).set(req.body).where(eq(menuItems.id, req.params.id)).returning();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    await db.update(menuItems).set({ isActive: false }).where(eq(menuItems.id, req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

export default router;
