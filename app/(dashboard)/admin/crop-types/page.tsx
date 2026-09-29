import type { Metadata } from "next"

import { CropTypesAdmin } from "@/components/admin/crop-types/crop-types-admin"

export const metadata: Metadata = { title: "Crop types" }

export default function AdminCropTypesPage() {
  return <CropTypesAdmin />
}
