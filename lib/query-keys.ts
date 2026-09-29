import type { AvailabilityParams } from "@/lib/api/availability"
import type { CropTypeListQuery } from "@/lib/api/crop-types"
import type { AdminUserQuery, AdminWarehouseQuery, AuditLogQuery } from "@/types/admin"
import type { BookingListQuery } from "@/types/booking"
import type { PaymentListQuery } from "@/types/payment"
import type { MyWarehouseListQuery } from "@/types/warehouse"

export const queryKeys = {
  me: ["users", "me"] as const,
  farmerProfile: ["users", "me", "farmer-profile"] as const,
  ownerProfile: ["users", "me", "owner-profile"] as const,
  dashboard: ["users", "me", "dashboard"] as const,
  adminStats: ["admin", "stats"] as const,
  adminWarehouses: (query: AdminWarehouseQuery) => ["admin", "warehouses", query] as const,
  adminUsers: (query: AdminUserQuery) => ["admin", "users", "list", query] as const,
  adminUser: (id: string) => ["admin", "users", "detail", id] as const,
  auditLogs: (query: AuditLogQuery) => ["admin", "audit-logs", query] as const,
  cropTypes: (query: CropTypeListQuery) => ["crop-types", query] as const,
  adminBookings: (query: BookingListQuery) => ["bookings", "admin", query] as const,
  bookings: ["bookings"] as const,
  myBookings: (query: BookingListQuery) => ["bookings", "mine", query] as const,
  warehouseBookings: (warehouseId: string, query: BookingListQuery) => ["bookings", "warehouse", warehouseId, query] as const,
  booking: (id: string) => ["bookings", "detail", id] as const,
  bookingInvoice: (id: string) => ["bookings", "invoice", id] as const,
  payments: ["payments"] as const,
  myPayments: (query: PaymentListQuery) => ["payments", "mine", query] as const,
  paymentSession: (sessionId: string) => ["payments", "session", sessionId] as const,
  myWarehouses: (query: MyWarehouseListQuery) => ["warehouses", "mine", query] as const,
  ownerWarehouse: (id: string) => ["warehouses", "detail", id] as const,
  warehouseChambers: (warehouseId: string) => ["warehouses", "chambers", warehouseId] as const,
  warehouseAvailability: (warehouseId: string, params: AvailabilityParams) =>
    ["availability", "warehouse", warehouseId, params] as const,
  chamberAvailability: (chamberId: string, params: AvailabilityParams) =>
    ["availability", "chamber", chamberId, params] as const,
}
