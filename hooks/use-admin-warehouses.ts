import { keepPreviousData, type QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { WAREHOUSE_STATUS } from "@/constants/warehouse-status"
import { adminApi } from "@/lib/api/admin"
import { getErrorMessage } from "@/lib/api/form-errors"
import { queryKeys } from "@/lib/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { AdminWarehouse, AdminWarehouseQuery } from "@/types/admin"
import type { Paginated } from "@/types/api"
import type { WarehouseStatus } from "@/types/warehouse"

const LISTS = ["admin", "warehouses"] as const

export function useAdminWarehouses(query: AdminWarehouseQuery) {
  const enabled = useAuthStore((state) => state.status === "authenticated" && state.user?.role === "ADMIN")

  return useQuery({
    queryKey: queryKeys.adminWarehouses(query),
    queryFn: async ({ signal }): Promise<Paginated<AdminWarehouse>> => {
      const result = await adminApi.warehouses(query, signal)
      return {
        items: result.data,
        meta: result.meta ?? { page: 1, limit: result.data.length, total: result.data.length, totalPages: 1 },
      }
    },
    enabled,
    placeholderData: keepPreviousData,
  })
}

type Variables = { id: string; name: string; status: WarehouseStatus; reason?: string }
type Snapshot = [QueryKey, Paginated<AdminWarehouse> | undefined][]

const SUCCESS: Record<WarehouseStatus, (name: string) => { title: string; description: string }> = {
  APPROVED: (name) => ({ title: `${name} is live`, description: "Farmers can now find and book it." }),
  REJECTED: (name) => ({ title: `${name} rejected`, description: "It stays hidden from farmers." }),
  SUSPENDED: (name) => ({ title: `${name} suspended`, description: "Hidden from farmers. Stored lots are unaffected." }),
  PENDING: (name) => ({ title: `${name} moved back to review`, description: "It waits in the review queue." }),
}

export function useSetWarehouseStatus() {
  const queryClient = useQueryClient()
  const adminName = useAuthStore((state) => state.user?.name ?? null)

  return useMutation<unknown, Error, Variables, Snapshot>({
    mutationKey: ["admin", "warehouse-status"],
    mutationFn: ({ id, status, reason }) => adminApi.setWarehouseStatus(id, status, reason),
    onMutate: async ({ id, status, reason }) => {
      await queryClient.cancelQueries({ queryKey: LISTS })
      const snapshot = queryClient.getQueriesData<Paginated<AdminWarehouse>>({ queryKey: LISTS })
      for (const [key, page] of snapshot) {
        if (!page) continue
        queryClient.setQueryData<Paginated<AdminWarehouse>>(key, {
          ...page,
          items: page.items.map((warehouse) =>
            warehouse.id === id
              ? {
                  ...warehouse,
                  status,
                  lastDecision: { status, reason: reason ?? null, at: new Date().toISOString(), by: adminName },
                }
              : warehouse
          ),
        })
      }
      return snapshot
    },
    onError: (error, _variables, snapshot) => {
      for (const [key, page] of snapshot ?? []) queryClient.setQueryData(key, page)
      toast.error("Couldn't change the warehouse status", { description: getErrorMessage(error) })
    },
    onSuccess: (_data, { name, status }) => {
      const { title, description } = SUCCESS[status](name)
      toast.success(title, { description })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: LISTS })
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminStats })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function statusLabel(status: string | null) {
  return status && status in WAREHOUSE_STATUS ? WAREHOUSE_STATUS[status as WarehouseStatus].label : status
}
