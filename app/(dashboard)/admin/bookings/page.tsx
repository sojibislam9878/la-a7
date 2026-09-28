import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/dashboard/page-placeholder"

export const metadata: Metadata = { title: "Bookings" }

export default function AdminBookingsPage() {
  return <PagePlaceholder title="Bookings" description="Every booking on the platform, across all states." />
}
