import type { Metadata } from "next"

import { AdminInspections } from "@/components/admin/inspections/admin-inspections"

export const metadata: Metadata = { title: "Inspections" }

export default function AdminInspectionsPage() {
  return <AdminInspections />
}
