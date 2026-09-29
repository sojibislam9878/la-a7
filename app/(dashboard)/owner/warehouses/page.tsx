import type { Metadata } from "next"

import { MyWarehouses } from "@/components/owner/warehouses/my-warehouses"

export const metadata: Metadata = { title: "My warehouses" }

export default function OwnerWarehousesPage() {
  return <MyWarehouses />
}
