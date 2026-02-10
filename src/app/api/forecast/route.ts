import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateForecast } from "@/lib/engines/forecast";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get("locationId");

    if (!locationId) {
      return NextResponse.json({ error: "Location ID is required" }, { status: 400 });
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

    // Generate forecast for the next 7 days
    const forecasts = [];
    const now = new Date();
    for (let i = 0; i < 7 * 24; i++) {
        const targetDate = new Date(now.getTime() + i * 60 * 60 * 1000);
        targetDate.setMinutes(0, 0, 0);
        
        const prediction = calculateForecast(history, targetDate);
        forecasts.push({
            timestamp: targetDate.toISOString(),
            ...prediction,
        });
    }

    return NextResponse.json(forecasts);
  } catch (error: any) {
    console.error("Forecasting error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
