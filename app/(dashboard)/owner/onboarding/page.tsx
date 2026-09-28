import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/dashboard/page-placeholder"

export const metadata: Metadata = { title: "Business profile" }

export default function OwnerOnboardingPage() {
  return <PagePlaceholder title="Business profile" description="Your trade license and NID details, required before listing warehouses." />
}
