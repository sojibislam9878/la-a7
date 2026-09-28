import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { bookingsApi } from "@/lib/api/bookings"
import { queryKeys } from "@/lib/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { Booking, BookingListQuery, CreateBookingPayload } from "@/types/booking"
import type { Paginated } from "@/types/api"

function useIsAuthenticated() {
  return useAuthStore((state) => state.status === "authenticated")
}

export function useMyBookings(query: BookingListQuery) {
  const authenticated = useIsAuthenticated()

  return useQuery({
    queryKey: queryKeys.myBookings(query),
    queryFn: async ({ signal }): Promise<Paginated<Booking>> => {
      const result = await bookingsApi.listMine(query, signal)
      return {
        items: result.data,
        meta: result.meta ?? { page: 1, limit: result.data.length, total: result.data.length, totalPages: 1 },
      }
    },
    enabled: authenticated,
    placeholderData: keepPreviousData,
  })
}

export function useBooking(id: string) {
  const authenticated = useIsAuthenticated()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: async ({ signal }) => (await bookingsApi.get(id, signal)).data,
    enabled: authenticated,
    initialData: () =>
      queryClient
        .getQueriesData<Paginated<Booking>>({ queryKey: ["bookings", "mine"] })
        .flatMap(([, page]) => page?.items ?? [])
        .find((booking) => booking.id === id),
    initialDataUpdatedAt: 0,
  })
}

export function useBookingInvoice(id: string) {
  const authenticated = useIsAuthenticated()

  return useQuery({
    queryKey: queryKeys.bookingInvoice(id),
    queryFn: async ({ signal }) => (await bookingsApi.invoice(id, signal)).data,
    enabled: authenticated,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["bookings", "create"],
    mutationFn: async (payload: CreateBookingPayload) => (await bookingsApi.create(payload)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      void queryClient.invalidateQueries({ queryKey: ["availability"] })
    },
  })
}
