import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/dashboard/page-placeholder"

export const metadata: Metadata = { title: "Booking requests" }

export default function OwnerBookingsPage() {
  return <PagePlaceholder title="Booking requests" description="Approve, reject, store and release farmers' lots." />
}
