import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/dashboard/page-placeholder"

export const metadata: Metadata = { title: "Profile" }

export default function FarmerProfilePage() {
  return <PagePlaceholder title="Profile" description="Your account details and farming profile." />
}
