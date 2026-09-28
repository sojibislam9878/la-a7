import type { Metadata } from "next"

import { PaymentResult } from "@/components/payment/payment-result"

export const metadata: Metadata = { title: "Payment status", robots: { index: false } }

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { session_id: sessionId } = await searchParams
  return <PaymentResult mode="success" sessionId={typeof sessionId === "string" && sessionId ? sessionId : null} />
}
