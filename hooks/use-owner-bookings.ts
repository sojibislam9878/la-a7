import { keepPreviousData, type QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { bookingsApi } from "@/lib/api/bookings"
import { getErrorMessage } from "@/lib/api/form-errors"
import { queryKeys } from "@/lib/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { Paginated } from "@/types/api"
import type { Booking, BookingListQuery, BookingStatus } from "@/types/booking"

const WAREHOUSE_LISTS = ["bookings", "warehouse"] as const

export function useWarehouseBookings(warehouseId: string | null, query: BookingListQuery) {
  const authenticated = useAuthStore((state) => state.status === "authenticated")

  return useQuery({
    queryKey: queryKeys.warehouseBookings(warehouseId ?? "", query),
    queryFn: async ({ signal }): Promise<Paginated<Booking>> => {
      const result = await bookingsApi.listForWarehouse(warehouseId!, query, signal)
      return {
        items: result.data,
        meta: result.meta ?? { page: 1, limit: result.data.length, total: result.data.length, totalPages: 1 },
      }
    },
    enabled: authenticated && !!warehouseId,
    placeholderData: keepPreviousData,
  })
}

type Snapshot = [QueryKey, Paginated<Booking> | undefined][]
type Variables = { id: string; lotCode: string; reason?: string }

function useOwnerTransition({
  action,
  next,
  mutationFn,
  success,
  errorTitle,
}: {
  action: string
  next: BookingStatus
  mutationFn: (variables: Variables) => Promise<Booking>
  success: (variables: Variables) => { title: string; description?: string }
  errorTitle: string
}) {
  const queryClient = useQueryClient()

  return useMutation<Booking, Error, Variables, Snapshot>({
    mutationKey: ["bookings", "owner", action],
    mutationFn,
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: WAREHOUSE_LISTS })
      const snapshot = queryClient.getQueriesData<Paginated<Booking>>({ queryKey: WAREHOUSE_LISTS })
      for (const [key, page] of snapshot) {
        if (!page) continue
        queryClient.setQueryData<Paginated<Booking>>(key, {
          ...page,
          items: page.items.map((booking) => (booking.id === id ? { ...booking, status: next } : booking)),
        })
      }
      return snapshot
    },
    onError: (error, _variables, snapshot) => {
      for (const [key, page] of snapshot ?? []) queryClient.setQueryData(key, page)
      toast.error(errorTitle, { description: getErrorMessage(error) })
    },
    onSuccess: (booking, variables) => {
      for (const [key, page] of queryClient.getQueriesData<Paginated<Booking>>({ queryKey: WAREHOUSE_LISTS })) {
        if (!page) continue
        queryClient.setQueryData<Paginated<Booking>>(key, {
          ...page,
          items: page.items.map((item) => (item.id === booking.id ? booking : item)),
        })
      }
      queryClient.setQueryData(queryKeys.booking(booking.id), booking)
      const { title, description } = success(variables)
      toast.success(title, { description })
    },
    onSettled: (_data, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: WAREHOUSE_LISTS })
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookingInvoice(id) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      void queryClient.invalidateQueries({ queryKey: ["availability"] })
    },
  })
}

export function useApproveBooking() {
  return useOwnerTransition({
    action: "approve",
    next: "APPROVED",
    mutationFn: async ({ id }) => (await bookingsApi.approve(id)).data,
    success: ({ lotCode }) => ({
      title: `Lot ${lotCode} approved`,
      description: "The space is held for 30 minutes while the farmer pays.",
    }),
    errorTitle: "Couldn't approve this booking",
  })
}

export function useRejectBooking() {
  return useOwnerTransition({
    action: "reject",
    next: "REJECTED",
    mutationFn: async ({ id, reason }) => (await bookingsApi.reject(id, reason)).data,
    success: ({ lotCode }) => ({ title: `Lot ${lotCode} rejected`, description: "The farmer has been told." }),
    errorTitle: "Couldn't reject this booking",
  })
}

export function useStoreBooking() {
  return useOwnerTransition({
    action: "store",
    next: "STORED",
    mutationFn: async ({ id }) => (await bookingsApi.store(id)).data,
    success: ({ lotCode }) => ({ title: `Lot ${lotCode} is in storage`, description: "Billing counts from today." }),
    errorTitle: "Couldn't mark this lot as stored",
  })
}

export function useCompleteBooking() {
  return useOwnerTransition({
    action: "complete",
    next: "COMPLETED",
    mutationFn: async ({ id }) => (await bookingsApi.complete(id)).data,
    success: ({ lotCode }) => ({ title: `Lot ${lotCode} released`, description: "The final bill is settled." }),
    errorTitle: "Couldn't complete this booking",
  })
}
