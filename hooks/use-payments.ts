import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { ApiError } from "@/lib/api/client"
import { paymentsApi } from "@/lib/api/payments"
import { queryKeys } from "@/lib/query-keys"

export const PAYMENT_POLL_INTERVAL_MS = 2000
export const PAYMENT_POLL_LIMIT_MS = 60 * 1000

export function useStartCheckout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["payments", "checkout"],
    mutationFn: async (bookingId: string) => (await paymentsApi.startCheckout(bookingId)).data,
    onSuccess: (session) => {
      window.location.assign(session.checkoutUrl)
    },
    onError: (error, bookingId) => {
      if (error instanceof ApiError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.booking(bookingId) })
        void queryClient.invalidateQueries({ queryKey: queryKeys.bookings })
      }
    },
  })
}

export function usePaymentStatus(sessionId: string | null, pollUntil: number | null) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: queryKeys.paymentSession(sessionId ?? ""),
    queryFn: async ({ signal }) => {
      const payment = (await paymentsApi.statusBySession(sessionId!, signal)).data
      if (payment.status !== "PENDING") {
        void queryClient.invalidateQueries({ queryKey: queryKeys.bookings })
        void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      }
      return payment
    },
    enabled: !!sessionId,
    staleTime: 0,
    retry: (count, error) => !(error instanceof ApiError && error.status === 404) && count < 2,
    refetchInterval: (query) =>
      pollUntil !== null && query.state.data?.status === "PENDING" && Date.now() < pollUntil
        ? PAYMENT_POLL_INTERVAL_MS
        : false,
  })
}
