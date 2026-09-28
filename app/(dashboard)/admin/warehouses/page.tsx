import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/dashboard/page-placeholder"

export const metadata: Metadata = { title: "Warehouses" }

export default function AdminWarehousesPage() {
  return <PagePlaceholder title="Warehouses" description="Approve, reject or suspend warehouse listings." />
}
