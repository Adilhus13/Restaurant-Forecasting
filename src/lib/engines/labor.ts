export interface LaborRecommendation {
  hosts: number;
  servers: number;
  kitchen: number;
}

export interface ServiceRatios {
  guestsPerServer: number;
  tablesPerHost: number;
  ordersPerKitchen: number;
  minHosts: number;
  minServers: number;
  minKitchen: number;
}

/**
 * Translates forecasted demand into labor needs based on service ratios.
 */
export function calculateLabor(
  guestCount: number,
  orderCount: number,
  ratios: ServiceRatios
): LaborRecommendation {
  const hostsNeeded = Math.max(
    ratios.minHosts,
    Math.ceil(guestCount / (ratios.tablesPerHost * 4)) // Assuming 4 guests per table
  );

  const serversNeeded = Math.max(
    ratios.minServers,
    Math.ceil(guestCount / ratios.guestsPerServer)
  );

  const kitchenNeeded = Math.max(
    ratios.minKitchen,
    Math.ceil(orderCount / ratios.ordersPerKitchen)
  );

  return {
    hosts: hostsNeeded,
    servers: serversNeeded,
    kitchen: kitchenNeeded,
  };
}

/**
 * Derives a confidence score based on the historical variance.
 * For simplicity, we compare the current average to the spread if we had more history.
 */
export function getConfidenceScore(variance: number): "high" | "medium" | "low" {
  if (variance < 0.1) return "high";
  if (variance < 0.25) return "medium";
  return "low";
}
