import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/dashboard/page-placeholder"

export const metadata: Metadata = { title: "Payments" }

export default function FarmerPaymentsPage() {
  return <PagePlaceholder title="Payments" description="Your Stripe payments and receipts." />
}
