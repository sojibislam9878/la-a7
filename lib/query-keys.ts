import type { AvailabilityParams } from "@/lib/api/availability"
import type { BookingListQuery } from "@/types/booking"

export const queryKeys = {
  me: ["users", "me"] as const,
  dashboard: ["users", "me", "dashboard"] as const,
  bookings: ["bookings"] as const,
  myBookings: (query: BookingListQuery) => ["bookings", "mine", query] as const,
  booking: (id: string) => ["bookings", "detail", id] as const,
  bookingInvoice: (id: string) => ["bookings", "invoice", id] as const,
  paymentSession: (sessionId: string) => ["payments", "session", sessionId] as const,
  warehouseAvailability: (warehouseId: string, params: AvailabilityParams) =>
    ["availability", "warehouse", warehouseId, params] as const,
  chamberAvailability: (chamberId: string, params: AvailabilityParams) =>
    ["availability", "chamber", chamberId, params] as const,
}
