import type { Metadata } from "next"

import { AdminBookings } from "@/components/admin/bookings/admin-bookings"

export const metadata: Metadata = { title: "All bookings" }

export default function AdminBookingsPage() {
  return <AdminBookings />
}
