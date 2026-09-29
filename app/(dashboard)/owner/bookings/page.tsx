import type { Metadata } from "next"

import { BookingQueue } from "@/components/owner/bookings/booking-queue"

export const metadata: Metadata = { title: "Booking requests" }

export default function OwnerBookingsPage() {
  return <BookingQueue />
}
