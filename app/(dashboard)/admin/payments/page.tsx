import type { Metadata } from "next"

import { AdminPayments } from "@/components/admin/payments/admin-payments"

export const metadata: Metadata = { title: "Payments" }

export default function AdminPaymentsPage() {
  return <AdminPayments />
}
