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
