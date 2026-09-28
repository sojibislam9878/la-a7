import type { Metadata } from "next"

import { RoleOverview } from "@/components/dashboard/role-overview"

export const metadata: Metadata = { title: "Farmer dashboard" }

export default function FarmerDashboardPage() {
  return <RoleOverview role="FARMER" />
}
