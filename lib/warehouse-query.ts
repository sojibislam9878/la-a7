import { z } from "zod"

import type { WarehouseQuery, WarehouseSortBy } from "@/types/warehouse"

export const WAREHOUSE_PAGE_SIZE = 9

export const SORT_OPTIONS: { value: string; label: string; sortBy: WarehouseSortBy; sortOrder: "asc" | "desc" }[] = [
  { value: "createdAt:desc", label: "Newest first", sortBy: "createdAt", sortOrder: "desc" },
  { value: "avgRating:desc", label: "Top rated", sortBy: "avgRating", sortOrder: "desc" },
  { value: "ratePerKgPerDay:asc", label: "Price: low to high", sortBy: "ratePerKgPerDay", sortOrder: "asc" },
  { value: "ratePerKgPerDay:desc", label: "Price: high to low", sortBy: "ratePerKgPerDay", sortOrder: "desc" },
  { value: "name:asc", label: "Name: A to Z", sortBy: "name", sortOrder: "asc" },
]
export const DEFAULT_SORT = SORT_OPTIONS[0].value

export const CAPACITY_OPTIONS = [
  { value: "1000", label: "1 t or more" },
  { value: "5000", label: "5 t or more" },
  { value: "10000", label: "10 t or more" },
  { value: "25000", label: "25 t or more" },
  { value: "50000", label: "50 t or more" },
]

export const RATING_OPTIONS = [
  { value: "3", label: "3+ stars" },
  { value: "4", label: "4+ stars" },
  { value: "4.5", label: "4.5+ stars" },
]

const optional = <T extends z.ZodType>(schema: T) => schema.optional().catch(undefined)

const urlQuerySchema = z.object({
  search: optional(z.string().trim().min(1).max(100)),
  district: optional(z.string().trim().min(1).max(60)),
  cropTypeId: optional(z.uuid()),
  minCapacityKg: optional(z.coerce.number().int().positive()),
  minRate: optional(z.coerce.number().nonnegative()),
  maxRate: optional(z.coerce.number().positive()),
  minRating: optional(z.coerce.number().min(1).max(5)),
  sortBy: optional(z.enum(["createdAt", "name", "ratePerKgPerDay", "avgRating"])),
  sortOrder: optional(z.enum(["asc", "desc"])),
  page: optional(z.coerce.number().int().positive()),
})

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams

function toRecord(params: RawParams) {
  const record: Record<string, string> = {}
  if (params instanceof URLSearchParams) {
    params.forEach((value, key) => {
      if (value !== "" && !(key in record)) record[key] = value
    })
  } else {
    for (const [key, value] of Object.entries(params)) {
      const first = Array.isArray(value) ? value[0] : value
      if (first !== undefined && first !== "") record[key] = first
    }
  }
  return record
}

export function parseWarehouseQuery(params: RawParams): WarehouseQuery {
  const query: WarehouseQuery = urlQuerySchema.parse(toRecord(params))
  if (query.minRate !== undefined && query.maxRate !== undefined && query.maxRate < query.minRate) {
    delete query.maxRate
  }
  return query
}

export function serializeWarehouseQuery(query: WarehouseQuery) {
  const params = new URLSearchParams()
  const sort = query.sortBy && query.sortOrder ? `${query.sortBy}:${query.sortOrder}` : undefined

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === "") continue
    if (key === "page" && value === 1) continue
    if ((key === "sortBy" || key === "sortOrder") && sort === DEFAULT_SORT) continue
    if (key === "limit") continue
    params.set(key, String(value))
  }
  return params.toString()
}

export function warehouseSearchHref(query: WarehouseQuery) {
  const qs = serializeWarehouseQuery(query)
  return qs ? `/warehouses?${qs}` : "/warehouses"
}

export function countActiveFilters(query: WarehouseQuery) {
  return (["district", "cropTypeId", "minCapacityKg", "minRate", "maxRate", "minRating"] as const).filter(
    (key) => query[key] !== undefined
  ).length
}
