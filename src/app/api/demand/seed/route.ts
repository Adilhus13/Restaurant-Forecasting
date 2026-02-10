import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSeedData } from "@/lib/utils/seed";
import { aggregateEventsToRollups } from "@/lib/utils/aggregation";

export async function POST(req: Request) {
  console.log("Seed API triggered");
  try {
    const body = await req.json();
    console.log("Request body:", body);
    const { locationId, groupName, locationName } = body;

    if (!locationId || !groupName || !locationName) {
      console.log("Missing fields");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure Restaurant Group and Location exist
    console.log("Checking group...");
    let group = await prisma.restaurantGroup.findFirst({ where: { name: groupName } });
    if (!group) {
        console.log("Creating group...");
        group = await prisma.restaurantGroup.create({ data: { name: groupName } });
    }

    console.log("Checking location...");
    let location = await prisma.location.findUnique({ where: { id: locationId } });
    if (!location) {
        console.log("Creating location...");
        location = await prisma.location.create({
            data: {
                id: locationId,
                name: locationName,
                restaurantGroupId: group.id
            }
        });
    }

    // Generate Seed Data
    console.log("Generating seed events...");
    const seedEvents = generateSeedData(locationId);
    
    // Batch Insert (SQLite has limits, so we chunk)
    console.log(`Inserting ${seedEvents.length} events in chunks...`);
    const chunkSize = 100;
    for (let i = 0; i < seedEvents.length; i += chunkSize) {
        const chunk = seedEvents.slice(i, i + chunkSize);
        await prisma.demandEvent.createMany({
            data: chunk.map(e => ({
                id: e.eventId,
                locationId: e.locationId,
                timestamp: new Date(e.timestamp),
                eventType: e.eventType,
                partySize: e.partySize,
                revenue: e.revenue,
                source: e.source
            })),
            skipDuplicates: true
        });
    }

    // Now generate rollups for all 60 days
    console.log("Generating rollups...");
    const allEvents = await prisma.demandEvent.findMany({ where: { locationId } });
    const rollups = aggregateEventsToRollups(locationId, allEvents);

    console.log(`Inserting ${rollups.length} rollups in chunks...`);
    const rollupChunkSize = 100;
    for (let i = 0; i < rollups.length; i += rollupChunkSize) {
        const chunk = rollups.slice(i, i + rollupChunkSize);
        await prisma.hourlyDemandRollup.createMany({
            data: chunk.map(r => ({
                locationId: r.locationId!,
                timestamp: r.timestamp!,
                hourOfDay: r.hourOfDay!,
                dayOfWeek: r.dayOfWeek!,
                avgGuests: r.avgGuests!,
                avgOrders: r.avgOrders!,
                avgRevenue: r.avgRevenue!,
            })),
            skipDuplicates: true
        });
    }

    console.log("Seed successful");
    return NextResponse.json({ message: "Seed data generated successfully", eventCount: seedEvents.length }, { status: 201 });
  } catch (error: any) {
    console.error("Seed data error:", error);
    return NextResponse.json({ 
        error: error.message,
        stack: error.stack 
    }, { status: 500 });
  }
}
