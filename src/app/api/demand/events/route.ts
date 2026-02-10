import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aggregateEventsToRollups } from "@/lib/utils/aggregation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, locationId, timestamp, eventType, partySize, revenue, source } = body;

    // Validation
    if (!eventId || !locationId || !timestamp || !eventType || partySize === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check for existing event (Idempotent ingestion)
    const existing = await prisma.demandEvent.findUnique({
      where: { id: eventId },
    });

    if (existing) {
      return NextResponse.json({ message: "Event already exists" }, { status: 200 });
    }

    // Insert event
    const event = await prisma.demandEvent.create({
      data: {
        id: eventId,
        locationId,
        timestamp: new Date(timestamp),
        eventType,
        partySize,
        revenue,
        source,
      },
    });

    // Update rollup for this hour
    const date = new Date(timestamp);
    date.setMinutes(0, 0, 0); // Start of hour
    const hourStart = date;

    // In a real scenario, this would be a background job.
    // Here we do it inline for simplicity but we should be careful with performance.
    const hourEvents = await prisma.demandEvent.findMany({
      where: {
        locationId,
        timestamp: {
          gte: hourStart,
          lt: new Date(hourStart.getTime() + 60 * 60 * 1000),
        },
      },
    });

    const rollups = aggregateEventsToRollups(locationId, hourEvents);
    if (rollups.length > 0) {
      const rollupData = rollups[0];
      await prisma.hourlyDemandRollup.upsert({
        where: {
          // This would need a unique constraint on locationId + timestamp in prisma schema
          // For now we'll find and update or create
          id: (await prisma.hourlyDemandRollup.findFirst({
            where: { locationId, timestamp: hourStart }
          }))?.id || 'temp-id'
        },
        update: {
          avgGuests: rollupData.avgGuests,
          avgOrders: rollupData.avgOrders,
          avgRevenue: rollupData.avgRevenue,
        },
        create: {
          locationId,
          timestamp: hourStart,
          hourOfDay: hourStart.getHours(),
          dayOfWeek: hourStart.getDay(),
          avgGuests: rollupData.avgGuests || 0,
          avgOrders: rollupData.avgOrders || 0,
          avgRevenue: rollupData.avgRevenue || 0,
        },
      });
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error("Demand ingestion error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
