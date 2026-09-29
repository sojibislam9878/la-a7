import { z } from "zod"

import type { MyWarehouseListQuery, MyWarehouseSortBy } from "@/types/warehouse"

export const MY_WAREHOUSES_PAGE_SIZE = 6

export const MY_WAREHOUSE_SORT_OPTIONS: {
  value: string
  label: string
  sortBy: MyWarehouseSortBy
  sortOrder: "asc" | "desc"
}[] = [
  { value: "createdAt:desc", label: "Newest first", sortBy: "createdAt", sortOrder: "desc" },
  { value: "name:asc", label: "Name, A to Z", sortBy: "name", sortOrder: "asc" },
  { value: "ratePerKgPerDay:desc", label: "Highest rate", sortBy: "ratePerKgPerDay", sortOrder: "desc" },
  { value: "avgRating:desc", label: "Top rated", sortBy: "avgRating", sortOrder: "desc" },
]
export const DEFAULT_MY_WAREHOUSE_SORT = MY_WAREHOUSE_SORT_OPTIONS[0].value

const optional = <T extends z.ZodType>(schema: T) => schema.optional().catch(undefined)

const schema = z.object({
  status: optional(z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"])),
  sort: optional(z.enum(MY_WAREHOUSE_SORT_OPTIONS.map((o) => o.value) as [string, ...string[]])),
  page: optional(z.coerce.number().int().positive()),
})

export type MyWarehouseListState = z.infer<typeof schema>

export function parseMyWarehouseListState(params: URLSearchParams): MyWarehouseListState {
  const record: Record<string, string> = {}
  params.forEach((value, key) => {
    if (value !== "") record[key] = value
  })
  return schema.parse(record)
}

export function toMyWarehouseListQuery(state: MyWarehouseListState): MyWarehouseListQuery {
  const sort =
    MY_WAREHOUSE_SORT_OPTIONS.find((o) => o.value === (state.sort ?? DEFAULT_MY_WAREHOUSE_SORT)) ??
    MY_WAREHOUSE_SORT_OPTIONS[0]
  return {
    ...(state.status ? { status: state.status } : {}),
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    page: state.page ?? 1,
    limit: MY_WAREHOUSES_PAGE_SIZE,
  }
}

export function serializeMyWarehouseListState(state: MyWarehouseListState) {
  const params = new URLSearchParams()
  if (state.status) params.set("status", state.status)
  if (state.sort && state.sort !== DEFAULT_MY_WAREHOUSE_SORT) params.set("sort", state.sort)
  if (state.page && state.page > 1) params.set("page", String(state.page))
  return params.toString()
}
