import { format, formatDistanceToNowStrict, parseISO } from "date-fns"
import { CalendarDaysIcon, PackageIcon, PhoneIcon, SnowflakeIcon, SproutIcon, UserRoundIcon } from "lucide-react"

import { HoldCountdown } from "@/components/booking/hold-countdown"
import { StatusBadge } from "@/components/booking/status-badge"
import { OwnerBookingActions } from "@/components/owner/bookings/owner-booking-actions"
import { isHoldExpired } from "@/constants/booking-status"
import { formatMoney, formatNumber } from "@/lib/format"
import type { Booking, BookingStatus } from "@/types/booking"

const OWNER_HINT: Record<BookingStatus, string> = {
  PENDING_APPROVAL: "New request. Approving holds the space for 30 minutes while the farmer pays.",
  APPROVED: "Approved. Waiting for the farmer's payment.",
  PAID: "Paid. Mark it stored once the produce arrives and is graded.",
  STORED: "In the chamber. The farmer requests withdrawal when ready.",
  WITHDRAW_REQUESTED: "The farmer wants to collect. Release the lot to settle the bill.",
  COMPLETED: "Collected and settled.",
  REJECTED: "You declined this request.",
  CANCELLED: "Cancelled by the farmer.",
  EXPIRED: "The payment window closed. The space was freed.",
}

export function OwnerBookingCard({ booking, now }: { booking: Booking; now: number }) {
  const holding = booking.status === "APPROVED" && !!booking.holdExpiresAt && !isHoldExpired(booking, now)
  const hint = isHoldExpired(booking, now)
    ? "The payment window closed. The space is free again."
    : OWNER_HINT[booking.status]
  const cost = booking.finalCost ?? booking.estimatedCost

  const details = [
    { icon: SproutIcon, label: "Crop", value: booking.cropType.name },
    { icon: PackageIcon, label: "Quantity", value: `${formatNumber(booking.quantityKg)} kg` },
    { icon: SnowflakeIcon, label: "Chamber", value: booking.chamber.name },
    {
      icon: CalendarDaysIcon,
      label: "Dates",
      value: `${format(parseISO(booking.startDate), "MMM d")} to ${format(parseISO(booking.endDate), "MMM d")} · ${booking.bookedDays} days`,
    },
  ]

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-soil/10 bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-mono text-sm font-semibold">{booking.lotCode}</h3>
            <StatusBadge booking={booking} now={now} />
            {holding && booking.holdExpiresAt && (
              <HoldCountdown expiresAt={booking.holdExpiresAt} className="text-sky-700 dark:text-sky-300" />
            )}
          </div>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="flex items-center gap-1.5 font-semibold">
              <UserRoundIcon className="size-4 text-muted-foreground" aria-hidden />
              {booking.farmer.name}
            </span>
            {booking.farmer.phone && (
              <a
                href={`tel:${booking.farmer.phone}`}
                className="flex items-center gap-1.5 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                <PhoneIcon className="size-3.5" aria-hidden />
                {booking.farmer.phone}
              </a>
            )}
            <span className="text-xs text-muted-foreground">
              Requested {formatDistanceToNowStrict(parseISO(booking.createdAt), { addSuffix: true })}
            </span>
          </p>
        </div>
        <div className="sm:text-right">
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

      {booking.cancelReason && (
        <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Reason:</span> {booking.cancelReason}
        </p>
      )}

      <div className="flex flex-col gap-3 border-t border-soil/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{hint}</p>
        <OwnerBookingActions booking={booking} />
      </div>
    </article>
  )
}
