import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/dashboard/page-placeholder"

export const metadata: Metadata = { title: "My reviews" }

export default function FarmerReviewsPage() {
  return <PagePlaceholder title="My reviews" description="Rate the warehouses where you completed a booking." />
}
