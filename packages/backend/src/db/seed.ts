import 'dotenv/config';
import { db, pool } from './index.js';
import { users, categories, menuItems, deliveryZones, timeSlots } from './schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');

  const existing = await db.select().from(users).where(eq(users.phone, '96899990000')).limit(1);
  if (existing.length === 0) {
    const adminPw = await bcrypt.hash('admin123', 10);
    await db.insert(users).values({
      phone: '96899990000',
      name: 'Admin',
      role: 'admin',
      passwordHash: adminPw,
    });
  }

  const catCount = await db.select().from(categories);
  if (catCount.length === 0) {
    const cats = await db.insert(categories).values([
      { nameAr: 'خبز عماني تقليدي', nameEn: 'Traditional Omani Bread', sortOrder: 1 },
      { nameAr: 'خبز أوروبي', nameEn: 'European Bread', sortOrder: 2 },
      { nameAr: 'خبز صحي', nameEn: 'Healthy Bread', sortOrder: 3 },
      { nameAr: 'معجنات', nameEn: 'Pastries', sortOrder: 4 },
    ]).returning();

    await db.insert(menuItems).values([
      { categoryId: cats[0].id, nameAr: 'خبز رقاق', nameEn: 'Raqaq Bread', description: 'خبز رقيق تقليدي', price: '0.500', maxPerOrder: 30 },
      { categoryId: cats[0].id, nameAr: 'خبز تنور', nameEn: 'Tannour Bread', description: 'خبز التنور العماني', price: '0.400', maxPerOrder: 20 },
      { categoryId: cats[0].id, nameAr: 'خبز حلوى', nameEn: 'Halwa Bread', description: 'خبز محلى بالعسل', price: '0.600', maxPerOrder: 15 },
      { categoryId: cats[1].id, nameAr: 'باغيت', nameEn: 'Baguette', description: 'باغيت فرنسي طازج', price: '0.800', maxPerOrder: 10 },
      { categoryId: cats[1].id, nameAr: 'خبز الحبوب الكاملة', nameEn: 'Whole Wheat Bread', description: 'خبز أسمر بالحبوب الكاملة', price: '0.700', maxPerOrder: 15 },
      { categoryId: cats[1].id, nameAr: 'تشباتي', nameEn: 'Chapati', description: 'خبز هندي رقيق', price: '0.300', maxPerOrder: 30 },
      { categoryId: cats[2].id, nameAr: 'خبز الشوفان', nameEn: 'Oat Bread', description: 'خبز صحي بالشوفان', price: '0.900', maxPerOrder: 10 },
      { categoryId: cats[2].id, nameAr: 'خبز gluten-free', nameEn: 'Gluten Free Bread', description: 'خبز خالٍ من الجلوتين', price: '1.200', maxPerOrder: 8 },
      { categoryId: cats[3].id, nameAr: 'كرواسون', nameEn: 'Croissant', description: 'كرواسون فرنسي', price: '0.500', maxPerOrder: 12 },
      { categoryId: cats[3].id, nameAr: 'دونات', nameEn: 'Donut', description: 'دونات محشوة', price: '0.400', maxPerOrder: 12 },
    ]);
  }

  const zoneCount = await db.select().from(deliveryZones);
  if (zoneCount.length === 0) {
    const salalahBoundary = 'POLYGON((54.04 16.99, 54.14 16.99, 54.14 17.05, 54.04 17.05, 54.04 16.99))';
    await db.insert(deliveryZones).values({
      name: 'Salalah',
      boundary: salalahBoundary,
    });
  }

  const slotCount = await db.select().from(timeSlots);
  if (slotCount.length === 0) {
    await db.insert(timeSlots).values([
      { labelAr: '٧-٩ صباحاً', labelEn: '7-9 AM', slotStart: '07:00', slotEnd: '09:00', maxOrders: 30 },
      { labelAr: '٩-١١ صباحاً', labelEn: '9-11 AM', slotStart: '09:00', slotEnd: '11:00', maxOrders: 25 },
      { labelAr: '١١-١ ظهراً', labelEn: '11 AM-1 PM', slotStart: '11:00', slotEnd: '13:00', maxOrders: 20 },
      { labelAr: '٤-٦ مساءً', labelEn: '4-6 PM', slotStart: '16:00', slotEnd: '18:00', maxOrders: 15 },
    ]);
  }

  console.log('Seed complete.');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
