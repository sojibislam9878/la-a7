import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ArrowRightIcon, CheckIcon, ClockIcon } from "lucide-react"

import { Leaf } from "@/components/shared/leaf"
import { Button } from "@/components/ui/button"
import { formatMoney, formatNumber } from "@/lib/format"
import type { Booking } from "@/types/booking"

export function BookingRequested({ booking }: { booking: Booking }) {
  const rows = [
    { label: "Lot code", value: booking.lotCode },
    { label: "Warehouse", value: `${booking.warehouse.name}, ${booking.warehouse.district}` },
    { label: "Chamber", value: booking.chamber.name },
    { label: "Crop", value: booking.cropType.name },
    { label: "Quantity", value: `${formatNumber(booking.quantityKg)} kg` },
    {
      label: "Dates",
      value: `${format(parseISO(booking.startDate), "MMM d")} to ${format(parseISO(booking.endDate), "MMM d, yyyy")} · ${booking.bookedDays} days`,
    },
    { label: "Estimated cost", value: formatMoney(booking.estimatedCost) },
  ]

  return (
    <div role="status" className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 py-6 text-center">
      <div className="relative">
        <Leaf className="absolute -top-4 -left-9 size-10 -rotate-45 text-primary/40" />
        <Leaf className="absolute -right-9 -bottom-2 size-9 rotate-[140deg] text-harvest/60" />
        <span className="flex size-20 items-center justify-center rounded-[58%_42%_52%_48%/55%_48%_52%_45%] bg-primary text-primary-foreground shadow-xl shadow-primary/30">
          <CheckIcon className="size-9" strokeWidth={3} aria-hidden />
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-3xl font-semibold">Booking request sent</h2>
        <p className="flex items-center justify-center gap-2 text-muted-foreground">
          <ClockIcon className="size-4" aria-hidden />
          Waiting for the warehouse owner to approve it.
        </p>
      </div>

      <dl className="w-full divide-y divide-soil/10 rounded-2xl border border-soil/10 bg-card text-left text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 px-5 py-3">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="text-right font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>

      <p className="max-w-md text-sm text-muted-foreground">
        We&apos;ll show the payment button on your booking as soon as the owner approves. The space is held for a short
        time after approval, so pay promptly.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Button size="lg" className="rounded-full" asChild>
          <Link href="/farmer/bookings">
            View my bookings
            <ArrowRightIcon data-icon="inline-end" aria-hidden />
          </Link>
        </Button>
        <Button size="lg" variant="outline" className="rounded-full" asChild>
          <Link href="/warehouses">Book more storage</Link>
        </Button>
      </div>
    </div>
  )
}
