import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { bookingsApi } from "@/lib/api/bookings"
import { getErrorMessage } from "@/lib/api/form-errors"
import { queryKeys } from "@/lib/query-keys"
import type { Paginated } from "@/types/api"
import type { Booking } from "@/types/booking"

type Snapshot = {
  detail: Booking | undefined
  lists: [QueryKey, Paginated<Booking> | undefined][]
}

type BookingVariables = { id: string; lotCode: string }

function useOptimisticBookingMutation<TVariables extends BookingVariables>({
  mutationKey,
  mutationFn,
  optimistic,
  successMessage,
  errorTitle,
}: {
  mutationKey: string
  mutationFn: (variables: TVariables) => Promise<Booking>
  optimistic: (booking: Booking, variables: TVariables) => Booking
  successMessage: (variables: TVariables) => { title: string; description: string }
  errorTitle: string
}) {
  const queryClient = useQueryClient()

  return useMutation<Booking, Error, TVariables, Snapshot>({
    mutationKey: ["bookings", mutationKey],
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings })

      const detailKey = queryKeys.booking(variables.id)
      const snapshot: Snapshot = {
        detail: queryClient.getQueryData<Booking>(detailKey),
        lists: queryClient.getQueriesData<Paginated<Booking>>({ queryKey: ["bookings", "mine"] }),
      }

      if (snapshot.detail) queryClient.setQueryData(detailKey, optimistic(snapshot.detail, variables))
      for (const [key, page] of snapshot.lists) {
        if (!page) continue
        queryClient.setQueryData<Paginated<Booking>>(key, {
          ...page,
          items: page.items.map((booking) => (booking.id === variables.id ? optimistic(booking, variables) : booking)),
        })
      }
      return snapshot
    },
    onError: (error, variables, snapshot) => {
      if (snapshot) {
        queryClient.setQueryData(queryKeys.booking(variables.id), snapshot.detail)
        for (const [key, page] of snapshot.lists) queryClient.setQueryData(key, page)
      }
      toast.error(errorTitle, { description: getErrorMessage(error) })
    },
    onSuccess: (booking, variables) => {
      queryClient.setQueryData(queryKeys.booking(booking.id), booking)
      const { title, description } = successMessage(variables)
      toast.success(title, { description })
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings })
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookingInvoice(variables.id) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      void queryClient.invalidateQueries({ queryKey: ["availability"] })
    },
  })
}

export function useCancelBooking() {
  return useOptimisticBookingMutation<BookingVariables & { reason?: string }>({
    mutationKey: "cancel",
    mutationFn: async ({ id, reason }) => (await bookingsApi.cancel(id, reason)).data,
    optimistic: (booking, { reason }) => ({ ...booking, status: "CANCELLED", cancelReason: reason ?? booking.cancelReason }),
    successMessage: ({ lotCode }) => ({ title: "Booking cancelled", description: `Lot ${lotCode} was cancelled.` }),
    errorTitle: "Couldn't cancel this booking",
  })
}

export function useRequestWithdrawal() {
  return useOptimisticBookingMutation<BookingVariables>({
    mutationKey: "withdraw",
    mutationFn: async ({ id }) => (await bookingsApi.requestWithdrawal(id)).data,
    optimistic: (booking) => ({ ...booking, status: "WITHDRAW_REQUESTED" }),
    successMessage: ({ lotCode }) => ({
      title: "Withdrawal requested",
      description: `The owner will release lot ${lotCode} and settle the bill.`,
    }),
    errorTitle: "Couldn't request withdrawal",
  })
}
