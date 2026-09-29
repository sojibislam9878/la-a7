import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { chambersApi } from "@/lib/api/chambers"
import { getErrorMessage } from "@/lib/api/form-errors"
import { queryKeys } from "@/lib/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { Chamber, ChamberPayload } from "@/types/warehouse"

export function useWarehouseChambers(warehouseId: string) {
  const authenticated = useAuthStore((state) => state.status === "authenticated")

  return useQuery({
    queryKey: queryKeys.warehouseChambers(warehouseId),
    queryFn: async ({ signal }) => (await chambersApi.listForWarehouse(warehouseId, signal)).data,
    enabled: authenticated,
  })
}

function useRefresh(warehouseId: string) {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.warehouseChambers(warehouseId) })
    void queryClient.invalidateQueries({ queryKey: ["warehouses", "mine"] })
    void queryClient.invalidateQueries({ queryKey: queryKeys.ownerWarehouse(warehouseId) })
    void queryClient.invalidateQueries({ queryKey: ["availability"] })
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
  }
}

export function useCreateChamber(warehouseId: string) {
  const queryClient = useQueryClient()
  const refresh = useRefresh(warehouseId)

  return useMutation({
    mutationKey: ["chambers", "create"],
    mutationFn: async (payload: ChamberPayload) => (await chambersApi.create(warehouseId, payload)).data,
    onSuccess: (chamber) => {
      queryClient.setQueryData<Chamber[]>(queryKeys.warehouseChambers(warehouseId), (list) =>
        list ? [...list, chamber].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })) : list
      )
      toast.success(`Chamber ${chamber.name} added`, { description: "It takes bookings while it's active." })
    },
    onSettled: refresh,
  })
}

type ChamberSnapshot = Chamber[] | undefined

function useOptimisticChamberMutation<TVariables extends { id: string }, TData>({
  warehouseId,
  mutationKey,
  mutationFn,
  apply,
  onSuccess,
  errorTitle,
}: {
  warehouseId: string
  mutationKey: string
  mutationFn: (variables: TVariables) => Promise<TData>
  apply: (list: Chamber[], variables: TVariables) => Chamber[]
  onSuccess: (data: TData, variables: TVariables) => void
  errorTitle: (variables: TVariables) => string
}) {
  const queryClient = useQueryClient()
  const refresh = useRefresh(warehouseId)
  const key = queryKeys.warehouseChambers(warehouseId)

  return useMutation<TData, Error, TVariables, ChamberSnapshot>({
    mutationKey: ["chambers", mutationKey],
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Chamber[]>(key)
      if (previous) queryClient.setQueryData(key, apply(previous, variables))
      return previous
    },
    onError: (error, variables, previous) => {
      if (previous) queryClient.setQueryData(key, previous)
      toast.error(errorTitle(variables), { description: getErrorMessage(error) })
    },
    onSuccess,
    onSettled: refresh,
  })
}

export function useUpdateChamber(warehouseId: string) {
  const queryClient = useQueryClient()

  return useOptimisticChamberMutation<{ id: string; payload: ChamberPayload; silent?: boolean }, Chamber>({
    warehouseId,
    mutationKey: "update",
    mutationFn: async ({ id, payload }) => (await chambersApi.update(id, payload)).data,
    apply: (list, { id, payload }) => list.map((chamber) => (chamber.id === id ? { ...chamber, ...payload } : chamber)),
    onSuccess: (chamber, { payload, silent }) => {
      queryClient.setQueryData<Chamber[]>(queryKeys.warehouseChambers(warehouseId), (list) =>
        list?.map((item) => (item.id === chamber.id ? chamber : item))
      )
      if (silent) return
      if (Object.keys(payload).length === 1 && payload.isActive !== undefined) {
        toast.success(payload.isActive ? `Chamber ${chamber.name} is taking bookings` : `Chamber ${chamber.name} paused`, {
          description: payload.isActive ? undefined : "Farmers can't book it. Lots already booked are unaffected.",
        })
        return
      }
      toast.success(`Chamber ${chamber.name} updated`)
    },
    errorTitle: ({ payload }) =>
      payload.isActive === undefined ? "Couldn't update the chamber" : "Couldn't change the chamber status",
  })
}

export function useDeleteChamber(warehouseId: string) {
  return useOptimisticChamberMutation<{ id: string; name: string }, void>({
    warehouseId,
    mutationKey: "delete",
    mutationFn: async ({ id }) => {
      await chambersApi.remove(id)
    },
    apply: (list, { id }) => list.filter((chamber) => chamber.id !== id),
    onSuccess: (_data, { name }) => {
      toast.success(`Chamber ${name} deleted`)
    },
    errorTitle: ({ name }) => `Couldn't delete chamber ${name}`,
  })
}
