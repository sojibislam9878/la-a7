import type { Metadata } from "next"

import { WarehouseManage } from "@/components/owner/chambers/warehouse-manage"
import { getCropTypes } from "@/lib/api/public-data"

export const metadata: Metadata = { title: "Manage warehouse" }

export default async function OwnerWarehousePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cropTypes = await getCropTypes().catch(() => [])
  return <WarehouseManage id={id} cropTypes={cropTypes} />
}
