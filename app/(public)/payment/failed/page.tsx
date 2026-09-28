import type { Metadata } from "next"

import { PaymentResult } from "@/components/payment/payment-result"

export const metadata: Metadata = { title: "Payment not completed", robots: { index: false } }

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { session_id: sessionId } = await searchParams
  return <PaymentResult mode="failed" sessionId={typeof sessionId === "string" && sessionId ? sessionId : null} />
}
