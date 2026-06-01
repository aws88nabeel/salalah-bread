import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { generateToken, requireAuth } from '../middleware/auth.js';
import { eq } from 'drizzle-orm';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { phone, name, password } = req.body;
    if (!phone || !name || !password) {
      return res.status(400).json({ error: 'Phone, name, and password required' });
    }
    const existing = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Phone already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({ phone, name, passwordHash }).returning();
    const token = generateToken({ userId: user.id, role: user.role, phone: user.phone });
    res.status(201).json({ token, user: { id: user.id, phone: user.phone, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password required' });
    }
    const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken({ userId: user.id, role: user.role, phone: user.phone });
    res.json({ token, user: { id: user.id, phone: user.phone, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  const [user] = await db.select().from(users).where(eq(users.id, req.user!.userId)).limit(1);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, phone: user.phone, name: user.name, role: user.role });
});

export default router;
