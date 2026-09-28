import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/dashboard/page-placeholder"

export const metadata: Metadata = { title: "Crop types" }

export default function AdminCropTypesPage() {
  return <PagePlaceholder title="Crop types" description="Reference crops with ideal temperature and storage limits." />
}
