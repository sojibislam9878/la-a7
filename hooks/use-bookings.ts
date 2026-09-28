import { useMutation, useQueryClient } from "@tanstack/react-query"

import { bookingsApi } from "@/lib/api/bookings"
import { queryKeys } from "@/lib/query-keys"
import type { CreateBookingPayload } from "@/types/booking"

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
