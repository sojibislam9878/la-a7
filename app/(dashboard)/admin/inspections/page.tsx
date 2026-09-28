import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/dashboard/page-placeholder"

export const metadata: Metadata = { title: "Inspections" }

export default function AdminInspectionsPage() {
  return <PagePlaceholder title="Inspections" description="Quality grades recorded at intake." />
}
