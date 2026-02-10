import { v4 as uuidv4 } from "uuid";

export interface DemandEvent {
  eventId: string;
  locationId: string;
  timestamp: string;
  eventType: "guest_arrival" | "order_placed" | "table_seated";
  partySize: number;
  revenue: number | null;
  source: "api" | "csv" | "seed";
}

/**
 * Generates 60 days of synthetic data for a given location.
 */
export function generateSeedData(locationId: string): DemandEvent[] {
  const events: DemandEvent[] = [];
  const now = new Date();
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(now.getDate() - 60);

  for (let d = new Date(sixtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
    // For each day, generate hourly events
    for (let h = 8; h < 22; h++) { // 8 AM to 10 PM
      const baseGuests = getBaseGuestsForHour(h);
      const guestCount = Math.max(0, Math.floor(baseGuests + (Math.random() * 10 - 5)));

      for (let i = 0; i < guestCount; i++) {
        const timestamp = new Date(d);
        timestamp.setHours(h);
        timestamp.setMinutes(Math.floor(Math.random() * 60));

        events.push({
          eventId: uuidv4(),
          locationId,
          timestamp: timestamp.toISOString(),
          eventType: "guest_arrival",
          partySize: Math.floor(Math.random() * 4) + 1,
          revenue: null,
          source: "seed",
        });

        // Add an order event for each guest arrival roughly
        events.push({
          eventId: uuidv4(),
          locationId,
          timestamp: new Date(timestamp.getTime() + 15 * 60000).toISOString(),
          eventType: "order_placed",
          partySize: 1,
          revenue: Math.random() * 50 + 10,
          source: "seed",
        });
      }
    }
  }

  return events;
}

function getBaseGuestsForHour(hour: number): number {
  // Lunch peak
  if (hour >= 12 && hour <= 14) return 20;
  // Dinner peak
  if (hour >= 18 && hour <= 20) return 35;
  // Off peak
  return 10;
}
