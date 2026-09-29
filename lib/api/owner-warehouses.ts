import { authedRequest } from "@/lib/api/authed"
import type { MyWarehouseListQuery, Warehouse, WarehouseDetail, WarehousePayload } from "@/types/warehouse"

function toQueryString(query: MyWarehouseListQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export const ownerWarehousesApi = {
  listMine: (query: MyWarehouseListQuery, signal?: AbortSignal) =>
    authedRequest<Warehouse[]>(`/warehouses/me${toQueryString(query)}`, { signal }),
  get: (id: string, signal?: AbortSignal) => authedRequest<WarehouseDetail>(`/warehouses/${id}`, { signal }),
  create: (payload: WarehousePayload) => authedRequest<WarehouseDetail>("/warehouses", { method: "POST", body: payload }),
  update: (id: string, payload: WarehousePayload) =>
    authedRequest<WarehouseDetail>(`/warehouses/${id}`, { method: "PATCH", body: payload }),
  remove: (id: string) => authedRequest<null>(`/warehouses/${id}`, { method: "DELETE" }),
}
