import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { feedbackId, locationId, date, actualGuests, actualLaborHours, avgWaitTime } = body;

    if (!feedbackId || !locationId || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const feedback = await prisma.feedbackEvent.create({
      data: {
        id: feedbackId,
        locationId,
        date: new Date(date),
        actualGuests: parseInt(actualGuests),
        actualLaborHours: parseFloat(actualLaborHours),
        avgWaitTime: parseFloat(avgWaitTime),
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error: any) {
    console.error("Feedback ingestion error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
