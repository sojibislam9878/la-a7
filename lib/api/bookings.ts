import { authedRequest } from "@/lib/api/authed"
import type { Booking, CreateBookingPayload } from "@/types/booking"

export const bookingsApi = {
  create: (payload: CreateBookingPayload) => authedRequest<Booking>("/bookings", { method: "POST", body: payload }),
}
