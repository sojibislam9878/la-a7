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

export type AdminUser = {
  id: string
  name: string
  email: string
  phone: string | null
  role: Role
  status: "ACTIVE" | "BANNED"
  emailVerified: boolean
  hasPassword: boolean
  linkedGoogle: boolean
  profileComplete: boolean
  deletedAt: string | null
  createdAt: string
}

export type AdminUserDetail = AdminUser & {
  farmerProfile: { district: string; upazila: string | null; nid: string | null; farmSizeAcre: number | null } | null
  ownerProfile: { businessName: string; tradeLicenseNo: string; nid: string; district: string; address: string } | null
  counts: { warehouses: number; bookings: number }
}

export type AdminUserQuery = {
  search?: string
  role?: Role
  status?: "ACTIVE" | "BANNED"
  verified?: "true" | "false"
  includeDeleted?: "true"
  sortBy?: "createdAt" | "name" | "email" | "role"
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

export type AuditLogEntry = {
  id: string
  action: string
  entityType: string
  entityId: string
  before: unknown
  after: unknown
  ip: string | null
  createdAt: string
  actor: { id: string; name: string; role: Role } | null
}

export type AuditLogQuery = {
  entityType?: string
  entityId?: string
  actorId?: string
  action?: string
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}
