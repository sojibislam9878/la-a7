import type { Metadata } from "next"

import { MyPayments } from "@/components/payment/my-payments"

export const metadata: Metadata = { title: "Payments" }

export default function FarmerPaymentsPage() {
  return <MyPayments />
}
