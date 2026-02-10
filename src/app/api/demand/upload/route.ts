import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aggregateEventsToRollups } from "@/lib/utils/aggregation";
import { getUserFromHeader } from "@/lib/auth";

// Accepts a raw CSV POST body (text/csv) with header row matching the DemandEvent fields
export async function POST(req: Request) {
  const user = getUserFromHeader(req.headers);
  if (!user) return NextResponse.json({ error: 'Unauthorized: missing x-user header' }, { status: 401 });

  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('text/csv')) {
    return NextResponse.json({ error: 'Content-Type must be text/csv' }, { status: 400 });
  }

  const body = await req.text();
  const lines = body.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return NextResponse.json({ error: 'CSV must include header and at least one row' }, { status: 400 });

  const header = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1);
  const events = [] as any[];

  for (const r of rows) {
    const cols = r.split(',');
    const obj: any = {};
    header.forEach((h, i) => obj[h] = cols[i]);

    // Minimal validation
    if (!obj.eventId || !obj.locationId || !obj.timestamp || !obj.eventType) {
      return NextResponse.json({ error: 'Missing required fields in CSV rows' }, { status: 400 });
    }

    // Cross-location write check: manager limited
    if (user.role === 'manager' && user.locations && !user.locations.includes(obj.locationId)) {
      return NextResponse.json({ error: 'Manager not permitted to write to this location' }, { status: 403 });
    }

    events.push({
      id: obj.eventId,
      locationId: obj.locationId,
      timestamp: new Date(obj.timestamp),
      eventType: obj.eventType,
      partySize: parseInt(obj.partySize || '1'),
      revenue: obj.revenue ? parseFloat(obj.revenue) : null,
      source: 'csv',
    });
  }

  // Bulk insert with skipDuplicates
  await prisma.demandEvent.createMany({ data: events, skipDuplicates: true });

  // Recompute rollups for affected locations (simple inline approach)
  const locationId = events[0].locationId;
  const allEvents = await prisma.demandEvent.findMany({ where: { locationId } });
  const rollups = aggregateEventsToRollups(locationId, allEvents);
  for (const r of rollups) {
    await prisma.hourlyDemandRollup.upsert({
      where: { id: r.locationId + '::' + r.timestamp?.toISOString() },
      create: {
        id: r.locationId + '::' + r.timestamp?.toISOString(),
        locationId: r.locationId!,
        timestamp: r.timestamp!,
        hourOfDay: r.hourOfDay!,
        dayOfWeek: r.dayOfWeek!,
        avgGuests: r.avgGuests!,
        avgOrders: r.avgOrders!,
        avgRevenue: r.avgRevenue!,
      },
      update: {
        avgGuests: r.avgGuests!,
        avgOrders: r.avgOrders!,
        avgRevenue: r.avgRevenue!,
      }
    });
  }

  return NextResponse.json({ message: 'CSV ingested', eventCount: events.length });
}
