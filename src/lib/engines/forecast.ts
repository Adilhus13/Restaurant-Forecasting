import { HourlyDemandRollup } from "@prisma/client";

/**
 * Forecast logic: Use trailing 4-week averages by day-of-week and hour.
 * This function calculates the expected demand for a given date and hour.
 */
export function calculateForecast(
  history: HourlyDemandRollup[],
  targetDate: Date
): { guestCount: number; orderCount: number; revenue: number } {
  const targetDayOfWeek = targetDate.getDay();
  const targetHour = targetDate.getHours();

  // Filter history for the same day of week and same hour
  const relevantHistory = history.filter(
    (h) => h.dayOfWeek === targetDayOfWeek && h.hourOfDay === targetHour
  );

  if (relevantHistory.length === 0) {
    return { guestCount: 0, orderCount: 0, revenue: 0 };
  }

  // Calculate averages
  const sumGuests = relevantHistory.reduce((sum, h) => sum + h.avgGuests, 0);
  const sumOrders = relevantHistory.reduce((sum, h) => sum + h.avgOrders, 0);
  const sumRevenue = relevantHistory.reduce((sum, h) => sum + h.avgRevenue, 0);

  const count = relevantHistory.length;

  return {
    guestCount: Math.round(sumGuests / count),
    orderCount: Math.round(sumOrders / count),
    revenue: Math.round(sumRevenue / count),
  };
}

/**
 * Smooth staffing levels between hours to avoid sharp jumps.
 */
export function smoothStaffing(
  current: number,
  previous: number | null
): number {
  if (previous === null) return current;
  // If the jump is more than 2, mitigate it (just a simple example of smoothing)
  if (Math.abs(current - previous) > 2) {
    return Math.round((current + previous) / 2);
  }
  return current;
}
