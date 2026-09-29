import { keepPreviousData, type QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { ROLE_LABEL } from "@/constants/routes"
import { adminApi } from "@/lib/api/admin"
import { getErrorMessage } from "@/lib/api/form-errors"
import { queryKeys } from "@/lib/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { AdminUser, AdminUserDetail, AdminUserQuery, AuditLogQuery } from "@/types/admin"
import type { Paginated } from "@/types/api"
import type { Role } from "@/types/user"

const USER_LISTS = ["admin", "users", "list"] as const

function useIsAdmin() {
  return useAuthStore((state) => state.status === "authenticated" && state.user?.role === "ADMIN")
}

function toPaginated<T>(result: { data: T[]; meta?: Paginated<T>["meta"] }): Paginated<T> {
  return {
    items: result.data,
    meta: result.meta ?? { page: 1, limit: result.data.length, total: result.data.length, totalPages: 1 },
  }
}

export function useAdminUsers(query: AdminUserQuery) {
  const enabled = useIsAdmin()
  return useQuery({
    queryKey: queryKeys.adminUsers(query),
    queryFn: async ({ signal }) => toPaginated(await adminApi.users(query, signal)),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useAdminUser(id: string) {
  const enabled = useIsAdmin()
  return useQuery({
    queryKey: queryKeys.adminUser(id),
    queryFn: async ({ signal }) => (await adminApi.user(id, signal)).data,
    enabled,
  })
}

export function useAuditLogs(query: AuditLogQuery, { enabled = true }: { enabled?: boolean } = {}) {
  const isAdmin = useIsAdmin()
  return useQuery({
    queryKey: queryKeys.auditLogs(query),
    queryFn: async ({ signal }) => toPaginated(await adminApi.auditLogs(query, signal)),
    enabled: isAdmin && enabled,
    placeholderData: keepPreviousData,
  })
}

type Snapshot = { detail: AdminUserDetail | undefined; lists: [QueryKey, Paginated<AdminUser> | undefined][] }

function useUserMutation<TVariables extends { id: string; name: string }>({
  mutationKey,
  mutationFn,
  patch,
  success,
  errorTitle,
}: {
  mutationKey: string
  mutationFn: (variables: TVariables) => Promise<unknown>
  patch?: (variables: TVariables) => Partial<AdminUser>
  success: (variables: TVariables) => { title: string; description?: string }
  errorTitle: string
}) {
  const queryClient = useQueryClient()

  return useMutation<unknown, Error, TVariables, Snapshot>({
    mutationKey: ["admin", "users", mutationKey],
    mutationFn,
    onMutate: async (variables) => {
      const snapshot: Snapshot = {
        detail: queryClient.getQueryData<AdminUserDetail>(queryKeys.adminUser(variables.id)),
        lists: queryClient.getQueriesData<Paginated<AdminUser>>({ queryKey: USER_LISTS }),
      }
      if (!patch) return snapshot
      await queryClient.cancelQueries({ queryKey: ["admin", "users"] })
      const changes = patch(variables)
      if (snapshot.detail) queryClient.setQueryData(queryKeys.adminUser(variables.id), { ...snapshot.detail, ...changes })
      for (const [key, page] of snapshot.lists) {
        if (!page) continue
        queryClient.setQueryData<Paginated<AdminUser>>(key, {
          ...page,
          items: page.items.map((user) => (user.id === variables.id ? { ...user, ...changes } : user)),
        })
      }
      return snapshot
    },
    onError: (error, variables, snapshot) => {
      if (patch && snapshot) {
        queryClient.setQueryData(queryKeys.adminUser(variables.id), snapshot.detail)
        for (const [key, page] of snapshot.lists) queryClient.setQueryData(key, page)
      }
      toast.error(errorTitle, { description: getErrorMessage(error) })
    },
    onSuccess: (_data, variables) => {
      const { title, description } = success(variables)
      toast.success(title, { description })
    },
    onSettled: (_data, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      void queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminStats })
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUser(id) })
    },
  })
}

export function useSetUserStatus() {
  return useUserMutation<{ id: string; name: string; status: AdminUser["status"]; reason?: string }>({
    mutationKey: "status",
    mutationFn: ({ id, status, reason }) => adminApi.setUserStatus(id, status, reason),
    patch: ({ status }) => ({ status }),
    success: ({ name, status }) =>
      status === "BANNED"
        ? { title: `${name} is banned`, description: "They are signed out and can't log in until unbanned." }
        : { title: `${name} can log in again` },
    errorTitle: "Couldn't change the account status",
  })
}

export function useSetUserRole() {
  return useUserMutation<{ id: string; name: string; role: Role; reason?: string }>({
    mutationKey: "role",
    mutationFn: ({ id, role, reason }) => adminApi.setUserRole(id, role, reason),
    success: ({ name, role }) => ({
      title: `${name} is now a ${ROLE_LABEL[role].toLowerCase()}`,
      description: "The new workspace applies from their next sign-in.",
    }),
    errorTitle: "Couldn't change the role",
  })
}
