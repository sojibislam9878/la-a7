import type { Metadata } from "next"

import { MyBookings } from "@/components/booking/my-bookings"

export const metadata: Metadata = { title: "My bookings" }

export default function FarmerBookingsPage() {
  return <MyBookings />
}
