import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/dashboard/page-placeholder"

export const metadata: Metadata = { title: "Payments" }

export default function AdminPaymentsPage() {
  return <PagePlaceholder title="Payments" description="Platform payments and refunds." />
}
