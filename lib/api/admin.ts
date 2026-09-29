import { authedRequest } from "@/lib/api/authed"
import type {
  AdminUser,
  AdminUserDetail,
  AdminUserQuery,
  AdminWarehouse,
  AdminWarehouseQuery,
  AuditLogEntry,
  AuditLogQuery,
  PlatformStats,
} from "@/types/admin"
import type { Role } from "@/types/user"
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
  users: (query: AdminUserQuery, signal?: AbortSignal) =>
    authedRequest<AdminUser[]>(`/admin/users${toQueryString(query)}`, { signal }),
  user: (id: string, signal?: AbortSignal) => authedRequest<AdminUserDetail>(`/admin/users/${id}`, { signal }),
  setUserStatus: (id: string, status: AdminUser["status"], reason?: string) =>
    authedRequest<Pick<AdminUser, "id" | "name" | "email" | "role" | "status">>(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: reason ? { status, reason } : { status },
    }),
  setUserRole: (id: string, role: Role, reason?: string) =>
    authedRequest<Pick<AdminUser, "id" | "name" | "email" | "role" | "status">>(`/admin/users/${id}/role`, {
      method: "PATCH",
      body: reason ? { role, reason } : { role },
    }),
  auditLogs: (query: AuditLogQuery, signal?: AbortSignal) =>
    authedRequest<AuditLogEntry[]>(`/admin/audit-logs${toQueryString(query)}`, { signal }),
}
