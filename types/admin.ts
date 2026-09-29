import type { BookingStatus } from "@/types/booking"
import type { Role } from "@/types/user"
import type { WarehouseStatus } from "@/types/warehouse"

export type PlatformStats = {
  users: {
    total: number
    active: number
    banned: number
    deleted: number
    unverified: number
    byRole: Partial<Record<Role, number>>
  }
  warehouses: { total: number; byStatus: Partial<Record<WarehouseStatus, number>> }
  chambers: { total: number; totalCapacityKg: number }
  bookings: { total: number; byStatus: Partial<Record<BookingStatus, number>> }
  payments: { succeeded: number; revenueBdt: number }
  topDistricts: { district: string; warehouses: number }[]
}
