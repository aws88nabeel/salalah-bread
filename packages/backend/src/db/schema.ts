import { pgTable, uuid, varchar, text, decimal, boolean, timestamp, time, date, integer, uniqueIndex, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: varchar('phone', { length: 15 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  role: varchar('role', { length: 10 }).notNull().default('customer'),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  nameAr: varchar('name_ar', { length: 100 }).notNull(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  sortOrder: integer('sort_order').default(0),
});

export const menuItems = pgTable('menu_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').references(() => categories.id),
  nameAr: varchar('name_ar', { length: 100 }).notNull(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 6, scale: 3 }).notNull(),
  imageUrl: text('image_url'),
  maxPerOrder: integer('max_per_order').default(20),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const deliveryZones = pgTable('delivery_zones', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  boundary: text('boundary').notNull(),
});

export const timeSlots = pgTable('time_slots', {
  id: uuid('id').primaryKey().defaultRandom(),
  labelAr: varchar('label_ar', { length: 50 }).notNull(),
  labelEn: varchar('label_en', { length: 50 }).notNull(),
  slotStart: time('slot_start').notNull(),
  slotEnd: time('slot_end').notNull(),
  maxOrders: integer('max_orders').notNull().default(20),
  isActive: boolean('is_active').default(true),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => users.id),
  customerName: varchar('customer_name', { length: 100 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 15 }).notNull(),
  deliveryLat: decimal('delivery_lat', { precision: 9, scale: 6 }).notNull(),
  deliveryLng: decimal('delivery_lng', { precision: 9, scale: 6 }).notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  deliveryZoneId: uuid('delivery_zone_id').references(() => deliveryZones.id),
  slotId: uuid('slot_id').references(() => timeSlots.id),
  deliveryDate: date('delivery_date').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  notes: text('notes'),
  totalAmount: decimal('total_amount', { precision: 8, scale: 3 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_orders_date_slot').on(table.deliveryDate, table.slotId),
  index('idx_orders_status').on(table.status),
  index('idx_orders_customer').on(table.customerId),
]);

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: uuid('menu_item_id').references(() => menuItems.id),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 6, scale: 3 }).notNull(),
  subtotal: decimal('subtotal', { precision: 8, scale: 3 }).notNull(),
});
