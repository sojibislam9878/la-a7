export type WarehouseStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"

export type Warehouse = {
  id: string
  name: string
  district: string
  address: string
  ratePerKgPerDay: number
  minBookingDays: number
  status: WarehouseStatus
  avgRating: number | null
  reviewCount: number
  chamberCount: number
  totalCapacityKg: number
  createdAt: string
}

export type WarehouseDetail = Warehouse & {
  licenseNo: string
  owner: { id: string; name: string; businessName: string | null }
}

export type Chamber = {
  id: string
  warehouseId: string
  name: string
  capacityKg: number
  minTempC: number
  maxTempC: number
  isActive: boolean
  createdAt: string
}

export type Review = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  farmer: { id: string; name: string }
}

export type AvailabilityWindow = {
  startDate: string
  endDate: string
  days: number
}

export type AvailabilityCrop = {
  id: string
  name: string
  minTempC: number
  maxTempC: number
  maxStorageDays: number
}

export type ChamberAvailabilitySummary = {
  id: string
  name: string
  capacityKg: number
  minTempC: number
  maxTempC: number
  peakUsedKg: number
  availableKg: number
  fitsCrop: boolean | null
}

export type WarehouseAvailability = {
  warehouse: Pick<Warehouse, "id" | "name" | "status" | "minBookingDays" | "ratePerKgPerDay">
  window: AvailabilityWindow
  cropType: AvailabilityCrop | null
  meetsMinBookingDays: boolean
  withinCropMaxStorageDays: boolean | null
  totalAvailableKg: number
  chambers: ChamberAvailabilitySummary[]
}

export type DailyLoad = {
  date: string
  usedKg: number
  freeKg: number
}

export type ChamberAvailability = {
  chamber: Pick<Chamber, "id" | "name" | "capacityKg" | "minTempC" | "maxTempC" | "isActive">
  window: AvailabilityWindow
  cropType: AvailabilityCrop | null
  fitsCrop: boolean | null
  peakUsedKg: number
  availableKg: number
  overlappingBookings: number
  dailyBreakdown: DailyLoad[] | null
}

export type WarehouseSortBy = "createdAt" | "name" | "ratePerKgPerDay" | "avgRating"

export type WarehouseQuery = {
  search?: string
  district?: string
  cropTypeId?: string
  minCapacityKg?: number
  minRate?: number
  maxRate?: number
  minRating?: number
  sortBy?: WarehouseSortBy
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

export type MyWarehouseSortBy = "createdAt" | "name" | "ratePerKgPerDay" | "avgRating"

export type MyWarehouseListQuery = {
  status?: WarehouseStatus
  sortBy?: MyWarehouseSortBy
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

export type WarehousePayload = {
  name?: string
  district?: string
  address?: string
  licenseNo?: string
  ratePerKgPerDay?: number
  minBookingDays?: number
}
