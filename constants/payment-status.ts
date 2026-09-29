import { CheckCircle2Icon, ClockIcon, type LucideIcon, Undo2Icon, XCircleIcon } from "lucide-react"

import type { StatusTone } from "@/constants/booking-status"
import type { PaymentStatus } from "@/types/booking"

export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; tone: StatusTone; icon: LucideIcon }> = {
  PENDING: { label: "Processing", tone: "waiting", icon: ClockIcon },
  SUCCEEDED: { label: "Paid", tone: "active", icon: CheckCircle2Icon },
  FAILED: { label: "Failed", tone: "closed", icon: XCircleIcon },
  REFUNDED: { label: "Refunded", tone: "action", icon: Undo2Icon },
}

export const PAYMENT_STATUS_FILTERS: { value: PaymentStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "SUCCEEDED", label: "Paid" },
  { value: "PENDING", label: "Processing" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "FAILED", label: "Failed" },
]
