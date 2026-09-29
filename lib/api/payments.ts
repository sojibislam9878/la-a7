import { authedRequest } from "@/lib/api/authed"
import { apiRequest } from "@/lib/api/client"
import type { CheckoutSession, Payment, PaymentListQuery } from "@/types/payment"

function toQueryString(query: PaymentListQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export const paymentsApi = {
  startCheckout: (bookingId: string) =>
    authedRequest<CheckoutSession>("/payments/checkout-session", { method: "POST", body: { bookingId } }),

  listMine: (query: PaymentListQuery, signal?: AbortSignal) =>
    authedRequest<Payment[]>(`/payments/me${toQueryString(query)}`, { signal }),

  statusBySession: (sessionId: string, signal?: AbortSignal) =>
    apiRequest<Payment>(`/payments/success?${new URLSearchParams({ session_id: sessionId, format: "json" })}`, {
      signal,
    }),
}
