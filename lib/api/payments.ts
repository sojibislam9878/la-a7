import { authedRequest } from "@/lib/api/authed"
import { apiRequest } from "@/lib/api/client"
import type { CheckoutSession, Payment } from "@/types/payment"

export const paymentsApi = {
  startCheckout: (bookingId: string) =>
    authedRequest<CheckoutSession>("/payments/checkout-session", { method: "POST", body: { bookingId } }),

  statusBySession: (sessionId: string, signal?: AbortSignal) =>
    apiRequest<Payment>(`/payments/success?${new URLSearchParams({ session_id: sessionId, format: "json" })}`, {
      signal,
    }),
}
