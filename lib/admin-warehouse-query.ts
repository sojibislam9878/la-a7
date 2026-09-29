import { z } from "zod"

import { DISTRICTS } from "@/constants/districts"
import type { AdminWarehouseQuery } from "@/types/admin"

export const ADMIN_WAREHOUSES_PAGE_SIZE = 8
export const DEFAULT_ADMIN_WAREHOUSE_STATUS = "PENDING"

export const ADMIN_WAREHOUSE_SORT_OPTIONS = [
  { value: "createdAt:asc", label: "Oldest first", sortBy: "createdAt", sortOrder: "asc" },
  { value: "createdAt:desc", label: "Newest first", sortBy: "createdAt", sortOrder: "desc" },
  { value: "name:asc", label: "Name, A to Z", sortBy: "name", sortOrder: "asc" },
  { value: "avgRating:desc", label: "Top rated", sortBy: "avgRating", sortOrder: "desc" },
] as const satisfies readonly {
  value: string
  label: string
  sortBy: NonNullable<AdminWarehouseQuery["sortBy"]>
  sortOrder: "asc" | "desc"
}[]
export const DEFAULT_ADMIN_WAREHOUSE_SORT = ADMIN_WAREHOUSE_SORT_OPTIONS[0].value

const optional = <T extends z.ZodType>(schema: T) => schema.optional().catch(undefined)

const schema = z.object({
  status: optional(z.enum(["ALL", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"])),
  q: optional(z.string().trim().min(1).max(80)),
  district: optional(z.enum(DISTRICTS)),
  sort: optional(z.enum(ADMIN_WAREHOUSE_SORT_OPTIONS.map((o) => o.value) as [string, ...string[]])),
  page: optional(z.coerce.number().int().positive()),
})

export type AdminWarehouseListState = z.infer<typeof schema>

export function parseAdminWarehouseState(params: URLSearchParams): AdminWarehouseListState {
  const record: Record<string, string> = {}
  params.forEach((value, key) => {
    if (value !== "") record[key] = value
  })
  return schema.parse(record)
}

export function currentStatus(state: AdminWarehouseListState) {
  return state.status ?? DEFAULT_ADMIN_WAREHOUSE_STATUS
}

export function toAdminWarehouseQuery(state: AdminWarehouseListState): AdminWarehouseQuery {
  const status = currentStatus(state)
  const sort =
    ADMIN_WAREHOUSE_SORT_OPTIONS.find((o) => o.value === (state.sort ?? DEFAULT_ADMIN_WAREHOUSE_SORT)) ??
    ADMIN_WAREHOUSE_SORT_OPTIONS[0]
  return {
    ...(status === "ALL" ? {} : { status }),
    ...(state.q ? { search: state.q } : {}),
    ...(state.district ? { district: state.district } : {}),
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    page: state.page ?? 1,
    limit: ADMIN_WAREHOUSES_PAGE_SIZE,
  }
}

export function serializeAdminWarehouseState(state: AdminWarehouseListState) {
  const params = new URLSearchParams()
  if (state.status && state.status !== DEFAULT_ADMIN_WAREHOUSE_STATUS) params.set("status", state.status)
  if (state.q) params.set("q", state.q)
  if (state.district) params.set("district", state.district)
  if (state.sort && state.sort !== DEFAULT_ADMIN_WAREHOUSE_SORT) params.set("sort", state.sort)
  if (state.page && state.page > 1) params.set("page", String(state.page))
  return params.toString()
}
