import type { Metadata } from "next"

import { AuditLogs } from "@/components/admin/audit/audit-logs"

export const metadata: Metadata = { title: "Audit logs" }

export default function AdminAuditLogsPage() {
  return <AuditLogs />
}
