import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/dashboard/page-placeholder"

export const metadata: Metadata = { title: "My bookings" }

export default function FarmerBookingsPage() {
  return <PagePlaceholder title="My bookings" description="Track your storage bookings, pay approved ones and request withdrawals." />
}
