import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/dashboard/page-placeholder"

export const metadata: Metadata = { title: "New booking" }

export default function NewBookingPage() {
  return <PagePlaceholder title="New booking" description="Confirm your chamber, crop, quantity and dates." />
}
