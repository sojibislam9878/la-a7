import { STATUS_TONE_CLASS, statusMeta } from "@/constants/booking-status"
import { cn } from "@/lib/utils"
import type { Booking } from "@/types/booking"

export function StatusBadge({
  booking,
  now,
  className,
}: {
  booking: Pick<Booking, "status" | "holdExpiresAt">
  now?: number
  className?: string
}) {
  const meta = statusMeta(booking, now)
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
