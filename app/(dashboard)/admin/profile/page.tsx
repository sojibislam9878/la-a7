import type { Metadata } from "next"

import { AdminProfileView } from "@/components/admin/admin-profile-view"

export const metadata: Metadata = { title: "Profile" }

export default function AdminProfilePage() {
  return <AdminProfileView />
}
