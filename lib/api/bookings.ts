import { authedRequest } from "@/lib/api/authed"
import type { Booking, BookingInvoice, BookingListQuery, CreateBookingPayload } from "@/types/booking"

function toQueryString(query: BookingListQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export const bookingsApi = {
  create: (payload: CreateBookingPayload) => authedRequest<Booking>("/bookings", { method: "POST", body: payload }),
  listMine: (query: BookingListQuery, signal?: AbortSignal) =>
    authedRequest<Booking[]>(`/bookings/me${toQueryString(query)}`, { signal }),
  get: (id: string, signal?: AbortSignal) => authedRequest<Booking>(`/bookings/${id}`, { signal }),
  invoice: (id: string, signal?: AbortSignal) => authedRequest<BookingInvoice>(`/bookings/${id}/invoice`, { signal }),
  cancel: (id: string, reason?: string) =>
    authedRequest<Booking>(`/bookings/${id}/cancel`, { method: "PATCH", body: reason ? { reason } : {} }),
  requestWithdrawal: (id: string) => authedRequest<Booking>(`/bookings/${id}/withdraw-request`, { method: "PATCH" }),
}
