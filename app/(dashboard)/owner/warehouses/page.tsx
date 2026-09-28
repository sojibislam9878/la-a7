import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/dashboard/page-placeholder"

export const metadata: Metadata = { title: "My warehouses" }

export default function OwnerWarehousesPage() {
  return <PagePlaceholder title="My warehouses" description="Your warehouses, chambers, rates and approval status." />
}
