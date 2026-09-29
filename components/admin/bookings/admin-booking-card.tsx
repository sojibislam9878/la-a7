import { format, parseISO } from "date-fns"
import { CalendarDaysIcon, PackageIcon, SnowflakeIcon, SproutIcon, UserRoundIcon, WarehouseIcon } from "lucide-react"

import { InspectionDialog } from "@/components/admin/bookings/inspection-dialog"
import { StatusBadge } from "@/components/booking/status-badge"
import { STATUS_TONE_CLASS } from "@/constants/booking-status"
import { QUALITY_GRADE } from "@/constants/quality-grade"
import { formatMoney, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Booking } from "@/types/booking"

export function AdminBookingCard({ booking, now }: { booking: Booking; now: number }) {
  const inspection = booking.inspection
  const canInspect = booking.status === "PAID" && !inspection
  const cost = booking.finalCost ?? booking.estimatedCost

  const details = [
    { icon: SproutIcon, label: "Crop", value: booking.cropType.name },
    { icon: PackageIcon, label: "Declared", value: `${formatNumber(booking.quantityKg)} kg` },
    { icon: SnowflakeIcon, label: "Chamber", value: booking.chamber.name },
    {
      icon: CalendarDaysIcon,
      label: "Dates",
      value: `${format(parseISO(booking.startDate), "MMM d")} to ${format(parseISO(booking.endDate), "MMM d")}`,
    },
  ]

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-soil/10 bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-mono text-sm font-semibold">{booking.lotCode}</h3>
            <StatusBadge booking={booking} now={now} />
            {inspection && (
              <span
                className={cn(
                  "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold",
                  inspection.grade === "REJECTED" ? "bg-destructive/15 text-destructive" : STATUS_TONE_CLASS[QUALITY_GRADE[inspection.grade].tone]
                )}
              >
                {QUALITY_GRADE[inspection.grade].label} · {formatNumber(inspection.actualQtyKg)} kg
                {inspection.moisturePct !== null ? ` · ${inspection.moisturePct}% moisture` : ""}
              </span>
            )}
          </div>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="flex items-center gap-1.5">
              <UserRoundIcon className="size-4 text-muted-foreground" aria-hidden />
              <span className="font-semibold">{booking.farmer.name}</span>
              {booking.farmer.phone && <span className="text-muted-foreground">{booking.farmer.phone}</span>}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <WarehouseIcon className="size-4" aria-hidden />
              {booking.warehouse.name}, {booking.warehouse.district}
            </span>
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-lg font-bold tabular-nums">{formatMoney(cost)}</p>
          <p className="text-xs text-muted-foreground">{booking.finalCost === null ? "Estimated" : "Final bill"}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {details.map((item) => (
          <div key={item.label} className="flex items-start gap-2 rounded-xl bg-cream/60 px-3 py-2 dark:bg-muted/40">
            <item.icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{item.label}</dt>
              <dd className="text-sm font-medium">{item.value}</dd>
            </div>
          </div>
        ))}
      </dl>

      {(canInspect || booking.cancelReason) && (
        <div className="flex flex-col gap-3 border-t border-soil/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {canInspect
              ? "Paid and due for intake. Record the quality inspection when the lot arrives."
              : `Reason: ${booking.cancelReason}`}
          </p>
          {canInspect && <InspectionDialog booking={booking} />}
        </div>
      )}
    </article>
  )
}
