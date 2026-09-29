import { STATUS_TONE_CLASS } from "@/constants/booking-status"
import { WAREHOUSE_STATUS } from "@/constants/warehouse-status"
import { cn } from "@/lib/utils"
import type { WarehouseStatus } from "@/types/warehouse"

export function WarehouseStatusBadge({ status, className }: { status: WarehouseStatus; className?: string }) {
  const meta = WAREHOUSE_STATUS[status]
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
