import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateForecast } from "@/lib/engines/forecast";
import { calculateLabor } from "@/lib/engines/labor";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get("locationId");

    if (!locationId) {
      return NextResponse.json({ error: "Location ID is required" }, { status: 400 });
    }

    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    // Get historical rollups for the last 4 weeks
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const history = await prisma.hourlyDemandRollup.findMany({
      where: {
        locationId,
        timestamp: { gte: fourWeeksAgo },
      },
    });

    const laborPlan = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) { // Next 24 hours
        const targetDate = new Date(now.getTime() + i * 60 * 60 * 1000);
        targetDate.setMinutes(0, 0, 0);
        
        const prediction = calculateForecast(history, targetDate);
        const staffing = calculateLabor(prediction.guestCount, prediction.orderCount, {
            guestsPerServer: location.guestsPerServer,
            tablesPerHost: location.tablesPerHost,
            ordersPerKitchen: location.ordersPerKitchen,
            minHosts: location.minHosts,
            minServers: location.minServers,
            minKitchen: location.minKitchen,
        });

        laborPlan.push({
            hour: targetDate.toISOString(),
            recommendedStaff: staffing,
            confidence: "high" // Simplified for now
        });
    }

    return NextResponse.json(laborPlan);
  } catch (error: unknown) {
    console.error("Labor plan error:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
