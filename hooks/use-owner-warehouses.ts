import { keepPreviousData, type QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/lib/api/form-errors"
import { ownerWarehousesApi } from "@/lib/api/owner-warehouses"
import { queryKeys } from "@/lib/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { Paginated } from "@/types/api"
import type { MyWarehouseListQuery, Warehouse, WarehousePayload } from "@/types/warehouse"

const MINE = ["warehouses", "mine"] as const

function useIsAuthenticated() {
  return useAuthStore((state) => state.status === "authenticated")
}

export function useMyWarehouses(query: MyWarehouseListQuery) {
  const authenticated = useIsAuthenticated()

  return useQuery({
    queryKey: queryKeys.myWarehouses(query),
    queryFn: async ({ signal }): Promise<Paginated<Warehouse>> => {
      const result = await ownerWarehousesApi.listMine(query, signal)
      return {
        items: result.data,
        meta: result.meta ?? { page: 1, limit: result.data.length, total: result.data.length, totalPages: 1 },
      }
    },
    enabled: authenticated,
    placeholderData: keepPreviousData,
  })
}

export function useOwnerWarehouse(id: string | null) {
  const authenticated = useIsAuthenticated()

  return useQuery({
    queryKey: queryKeys.ownerWarehouse(id ?? ""),
    queryFn: async ({ signal }) => (await ownerWarehousesApi.get(id!, signal)).data,
    enabled: authenticated && !!id,
  })
}

function useRefreshWarehouses() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: MINE })
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
  }
}

export function useCreateWarehouse() {
  const refresh = useRefreshWarehouses()

  return useMutation({
    mutationKey: ["warehouses", "create"],
    mutationFn: async (payload: WarehousePayload) => (await ownerWarehousesApi.create(payload)).data,
    onSuccess: (warehouse) => {
      toast.success("Warehouse submitted for review", {
        description: `${warehouse.name} goes live once an admin approves it. You can add chambers meanwhile.`,
      })
    },
    onSettled: refresh,
  })
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient()
  const refresh = useRefreshWarehouses()

  return useMutation({
    mutationKey: ["warehouses", "update"],
    mutationFn: async ({ id, payload }: { id: string; payload: WarehousePayload }) =>
      (await ownerWarehousesApi.update(id, payload)).data,
    onSuccess: (warehouse) => {
      queryClient.setQueryData(queryKeys.ownerWarehouse(warehouse.id), warehouse)
      toast.success("Warehouse updated", { description: warehouse.name })
    },
    onSettled: refresh,
  })
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient()
  const refresh = useRefreshWarehouses()

  return useMutation<void, Error, { id: string; name: string }, [QueryKey, Paginated<Warehouse> | undefined][]>({
    mutationKey: ["warehouses", "delete"],
    mutationFn: async ({ id }) => {
      await ownerWarehousesApi.remove(id)
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: MINE })
      const snapshot = queryClient.getQueriesData<Paginated<Warehouse>>({ queryKey: MINE })
      for (const [key, page] of snapshot) {
        if (!page) continue
        queryClient.setQueryData<Paginated<Warehouse>>(key, {
          items: page.items.filter((warehouse) => warehouse.id !== id),
          meta: { ...page.meta, total: Math.max(0, page.meta.total - 1) },
        })
      }
      return snapshot
    },
    onError: (error, _variables, snapshot) => {
      for (const [key, page] of snapshot ?? []) queryClient.setQueryData(key, page)
      toast.error("Couldn't delete this warehouse", { description: getErrorMessage(error) })
    },
    onSuccess: (_data, { id, name }) => {
      queryClient.removeQueries({ queryKey: queryKeys.ownerWarehouse(id) })
      toast.success("Warehouse deleted", { description: `${name} and its chambers were removed.` })
    },
    onSettled: refresh,
  })
}
