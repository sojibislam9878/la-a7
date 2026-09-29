import type { Metadata } from "next"

import { OwnerProfileView } from "@/components/owner/owner-profile-view"

export const metadata: Metadata = { title: "Profile" }

export default function OwnerProfilePage() {
  return <OwnerProfileView />
}
