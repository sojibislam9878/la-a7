import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/dashboard/page-placeholder"

export const metadata: Metadata = { title: "Users" }

export default function AdminUsersPage() {
  return <PagePlaceholder title="Users" description="Search accounts, change roles and manage bans." />
}
