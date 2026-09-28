import type { AvailabilityParams } from "@/lib/api/availability"

export const queryKeys = {
  me: ["users", "me"] as const,
  dashboard: ["users", "me", "dashboard"] as const,
  bookings: ["bookings"] as const,
  warehouseAvailability: (warehouseId: string, params: AvailabilityParams) =>
    ["availability", "warehouse", warehouseId, params] as const,
  chamberAvailability: (chamberId: string, params: AvailabilityParams) =>
    ["availability", "chamber", chamberId, params] as const,
}
