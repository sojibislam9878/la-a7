import type { Metadata } from "next"

import { RoleOverview } from "@/components/dashboard/role-overview"

export const metadata: Metadata = { title: "Owner dashboard" }

export default function OwnerDashboardPage() {
  return <RoleOverview role="WAREHOUSE_OWNER" />
}
