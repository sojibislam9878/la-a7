import type { AvailabilityParams } from "@/lib/api/availability"
import type { BookingListQuery } from "@/types/booking"
import type { PaymentListQuery } from "@/types/payment"

export const queryKeys = {
  me: ["users", "me"] as const,
  farmerProfile: ["users", "me", "farmer-profile"] as const,
  ownerProfile: ["users", "me", "owner-profile"] as const,
  dashboard: ["users", "me", "dashboard"] as const,
  bookings: ["bookings"] as const,
  myBookings: (query: BookingListQuery) => ["bookings", "mine", query] as const,
  booking: (id: string) => ["bookings", "detail", id] as const,
  bookingInvoice: (id: string) => ["bookings", "invoice", id] as const,
  payments: ["payments"] as const,
  myPayments: (query: PaymentListQuery) => ["payments", "mine", query] as const,
  paymentSession: (sessionId: string) => ["payments", "session", sessionId] as const,
  warehouseAvailability: (warehouseId: string, params: AvailabilityParams) =>
    ["availability", "warehouse", warehouseId, params] as const,
  chamberAvailability: (chamberId: string, params: AvailabilityParams) =>
    ["availability", "chamber", chamberId, params] as const,
}
