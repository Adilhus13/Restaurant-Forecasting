import { DemandEvent, HourlyDemandRollup } from "@prisma/client";

/**
 * Aggregates raw demand events into hourly rollup objects.
 */
export function aggregateEventsToRollups(
  locationId: string,
  events: DemandEvent[]
): Partial<HourlyDemandRollup>[] {
  const rollups: Record<string, { guests: number; orders: number; revenue: number }> = {};

  events.forEach((event) => {
    const date = new Date(event.timestamp);
    date.setMinutes(0, 0, 0); // Round down to the start of the hour
    const key = date.toISOString();

    if (!rollups[key]) {
      rollups[key] = { guests: 0, orders: 0, revenue: 0 };
    }

    if (event.eventType === "guest_arrival") {
      rollups[key].guests += event.partySize;
    } else if (event.eventType === "order_placed") {
      rollups[key].orders += 1;
      rollups[key].revenue += event.revenue || 0;
    }
  });

  return Object.entries(rollups).map(([timestamp, data]) => ({
    locationId,
    timestamp: new Date(timestamp),
    hourOfDay: new Date(timestamp).getHours(),
    dayOfWeek: new Date(timestamp).getDay(),
    avgGuests: data.guests,
    avgOrders: data.orders,
    avgRevenue: data.revenue,
  }));
}
