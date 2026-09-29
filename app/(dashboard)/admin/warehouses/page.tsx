import type { Metadata } from "next"

import { AdminWarehouses } from "@/components/admin/warehouses/admin-warehouses"

export const metadata: Metadata = { title: "Warehouse review" }

export default function AdminWarehousesPage() {
  return <AdminWarehouses />
}
