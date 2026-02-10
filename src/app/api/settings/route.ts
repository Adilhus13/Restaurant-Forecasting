import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromHeader } from "@/lib/auth";

export async function POST(req: Request) {
  const user = getUserFromHeader(req.headers);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { locationId, guestsPerServer, tablesPerHost, ordersPerKitchen, minHosts, minServers, minKitchen } = body;
  if (!locationId) return NextResponse.json({ error: 'locationId required' }, { status: 400 });

  // Manager scope check
  if (user.role === 'manager' && user.locations && !user.locations.includes(locationId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const location = await prisma.location.update({
    where: { id: locationId },
    data: {
      guestsPerServer: guestsPerServer ?? undefined,
      tablesPerHost: tablesPerHost ?? undefined,
      ordersPerKitchen: ordersPerKitchen ?? undefined,
      minHosts: minHosts ?? undefined,
      minServers: minServers ?? undefined,
      minKitchen: minKitchen ?? undefined,
    },
  });

  return NextResponse.json({ message: 'Settings saved', location });
}
