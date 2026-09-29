import { authedRequest } from "@/lib/api/authed"
import type { Chamber, ChamberPayload } from "@/types/warehouse"

export const chambersApi = {
  listForWarehouse: (warehouseId: string, signal?: AbortSignal) =>
    authedRequest<Chamber[]>(`/warehouses/${warehouseId}/chambers?sortBy=name&sortOrder=asc&limit=100`, { signal }),
  create: (warehouseId: string, payload: ChamberPayload) =>
    authedRequest<Chamber>(`/warehouses/${warehouseId}/chambers`, { method: "POST", body: payload }),
  update: (id: string, payload: ChamberPayload) =>
    authedRequest<Chamber>(`/chambers/${id}`, { method: "PATCH", body: payload }),
  remove: (id: string) => authedRequest<null>(`/chambers/${id}`, { method: "DELETE" }),
}
