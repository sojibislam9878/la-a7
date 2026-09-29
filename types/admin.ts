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

export type AdminWarehouse = {
  id: string
  name: string
  district: string
  address: string
  licenseNo: string
  ratePerKgPerDay: number
  minBookingDays: number
  status: WarehouseStatus
  avgRating: number | null
  reviewCount: number
  chamberCount: number
  totalCapacityKg: number
  createdAt: string
  owner: {
    id: string
    name: string
    email: string
    phone: string | null
    businessName: string | null
    tradeLicenseNo: string | null
  }
  lastDecision: { status: string | null; reason: string | null; at: string; by: string | null } | null
}

export type AdminWarehouseQuery = {
  status?: WarehouseStatus
  search?: string
  district?: string
  sortBy?: "createdAt" | "name" | "ratePerKgPerDay" | "avgRating"
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}
