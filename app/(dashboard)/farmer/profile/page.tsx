import type { Metadata } from "next"

import { FarmerProfileView } from "@/components/profile/farmer-profile-view"

export const metadata: Metadata = { title: "Profile" }

export default function FarmerProfilePage() {
  return <FarmerProfileView />
}
