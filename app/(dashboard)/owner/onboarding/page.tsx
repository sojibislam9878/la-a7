import type { Metadata } from "next"

import { OwnerOnboarding } from "@/components/owner/owner-onboarding"

export const metadata: Metadata = { title: "Business profile" }

export default function OwnerOnboardingPage() {
  return <OwnerOnboarding />
}
