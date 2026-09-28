import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/dashboard/page-placeholder"

export const metadata: Metadata = { title: "Audit logs" }

export default function AdminAuditLogsPage() {
  return <PagePlaceholder title="Audit logs" description="Every status and role change, with before and after values." />
}
