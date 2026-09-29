import { authedRequest } from "@/lib/api/authed"
import type { AdminWarehouse, AdminWarehouseQuery, PlatformStats } from "@/types/admin"
import type { WarehouseStatus } from "@/types/warehouse"

function toQueryString(query: Record<string, string | number | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export const adminApi = {
  stats: (signal?: AbortSignal) => authedRequest<PlatformStats>("/admin/stats", { signal }),
  warehouses: (query: AdminWarehouseQuery, signal?: AbortSignal) =>
    authedRequest<AdminWarehouse[]>(`/admin/warehouses${toQueryString(query)}`, { signal }),
  setWarehouseStatus: (id: string, status: WarehouseStatus, reason?: string) =>
    authedRequest<{ id: string; name: string; status: WarehouseStatus }>(`/admin/warehouses/${id}/status`, {
      method: "PATCH",
      body: reason ? { status, reason } : { status },
    }),
}
