import type { PaymentStatus } from "@/types/booking"

export type Payment = {
  id: string
  bookingId: string
  lotCode: string
  amount: number
  currency: string
  amountBdt: number
  fxRate: number
  provider: string
  status: PaymentStatus
  paidAt: string | null
  refundedAt: string | null
  createdAt: string
}

export type CheckoutSession = {
  paymentId: string
  sessionId: string
  checkoutUrl: string
  amount: number
  currency: string
  expiresAt: string | null
}
