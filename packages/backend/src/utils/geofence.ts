import { db } from '../db/index.js';
import { deliveryZones } from '../db/schema.js';
import { sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

export async function isLocationInSalalah(lat: number, lng: number): Promise<boolean> {
  const result = await db.execute(
    sql`SELECT ST_Contains(
      (SELECT boundary::geometry FROM delivery_zones WHERE name = 'Salalah'),
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
    ) AS is_inside`
  );
  return result.rows[0]?.is_inside === true;
}

export async function getSalalahZone() {
  const zones = await db.select().from(deliveryZones).where(eq(deliveryZones.name, 'Salalah'));
  return zones[0] || null;
}
