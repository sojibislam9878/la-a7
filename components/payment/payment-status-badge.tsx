import { STATUS_TONE_CLASS } from "@/constants/booking-status"
import { PAYMENT_STATUS } from "@/constants/payment-status"
import { cn } from "@/lib/utils"
import type { PaymentStatus } from "@/types/booking"

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  const meta = PAYMENT_STATUS[status]
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold",
        STATUS_TONE_CLASS[meta.tone],
        className
      )}
    >
      <meta.icon className="size-3.5" aria-hidden />
      {meta.label}
    </span>
  )
}
