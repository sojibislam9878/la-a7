import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ArrowRightIcon, CalendarDaysIcon, SnowflakeIcon, SproutIcon, WarehouseIcon } from "lucide-react"

import { HoldCountdown } from "@/components/booking/hold-countdown"
import { StatusBadge } from "@/components/booking/status-badge"
import { isHoldExpired } from "@/constants/booking-status"
import { formatMoney, formatNumber } from "@/lib/format"
import type { Booking } from "@/types/booking"

export function BookingCard({ booking, now }: { booking: Booking; now: number }) {
  const cost = booking.finalCost ?? booking.estimatedCost
  const awaitingPayment = booking.status === "APPROVED" && !!booking.holdExpiresAt && !isHoldExpired(booking, now)

  return (
    <article className="group relative flex flex-col gap-4 rounded-2xl border border-soil/10 bg-card p-5 transition-shadow hover:shadow-md hover:shadow-primary/5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-mono text-sm font-semibold">
            <Link
              href={`/farmer/bookings/${booking.id}`}
              className="after:absolute after:inset-0 after:rounded-[inherit] focus-visible:outline-none"
            >
              {booking.lotCode}
            </Link>
          </h2>
          <StatusBadge booking={booking} now={now} />
          {awaitingPayment && booking.holdExpiresAt && (
            <HoldCountdown expiresAt={booking.holdExpiresAt} className="text-sky-700 dark:text-sky-300" />
          )}
        </div>

        <p className="flex items-center gap-2 font-semibold">
          <WarehouseIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">
            {booking.warehouse.name}
            <span className="font-normal text-muted-foreground">, {booking.warehouse.district}</span>
          </span>
        </p>

        <dl className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Crop and quantity</dt>
            <SproutIcon className="size-4" aria-hidden />
            <dd>
              {booking.cropType.name} · {formatNumber(booking.quantityKg)} kg
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Chamber</dt>
            <SnowflakeIcon className="size-4" aria-hidden />
            <dd>Chamber {booking.chamber.name}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Dates</dt>
            <CalendarDaysIcon className="size-4" aria-hidden />
            <dd>
              {format(parseISO(booking.startDate), "MMM d")} to {format(parseISO(booking.endDate), "MMM d, yyyy")} ·{" "}
              {booking.bookedDays} days
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-soil/10 pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
        <p className="text-right">
          <span className="block text-xs text-muted-foreground">
            {booking.finalCost !== null ? "Final cost" : "Estimated cost"}
          </span>
          <span className="text-xl font-bold">{formatMoney(cost)}</span>
        </p>
        <span className="flex items-center gap-1 text-sm font-medium text-primary">
          View details
          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </article>
  )
}
