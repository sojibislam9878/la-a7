"use client"

import Link from "next/link"
import { format, parseISO } from "date-fns"
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CalendarDaysIcon,
  MapPinIcon,
  PackageIcon,
  RotateCwIcon,
  SearchXIcon,
  SnowflakeIcon,
  SproutIcon,
  TagIcon,
} from "lucide-react"

import { BookingActions } from "@/components/booking/booking-actions"
import { BookingCharges } from "@/components/booking/booking-charges"
import { BookingTimeline } from "@/components/booking/booking-timeline"
import { HoldCountdown } from "@/components/booking/hold-countdown"
import { StatusBadge } from "@/components/booking/status-badge"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { PayButton } from "@/components/payment/pay-button"
import { EmptyState } from "@/components/shared/empty-state"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { isHoldExpired, STATUS_TONE_CLASS, statusMeta } from "@/constants/booking-status"
import { useBooking, useBookingInvoice } from "@/hooks/use-bookings"
import { useNow } from "@/hooks/use-now"
import { ApiError } from "@/lib/api/client"
import { getErrorMessage } from "@/lib/api/form-errors"
import { formatMoney, formatNumber, formatTempRange } from "@/lib/format"
import { cn } from "@/lib/utils"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function BookingDetail({ id }: { id: string }) {
  if (!UUID.test(id)) return <BookingNotFound />
  return <BookingDetailView id={id} />
}

function BookingNotFound() {
  return (
    <EmptyState
      icon={SearchXIcon}
      title="Booking not found"
      description="It may belong to another account, or the link is wrong."
      action={
        <Button className="rounded-full" asChild>
          <Link href="/farmer/bookings">Back to my bookings</Link>
        </Button>
      }
    />
  )
}

function BookingDetailView({ id }: { id: string }) {
  const booking = useBooking(id)
  const invoice = useBookingInvoice(id)
  const now = useNow()

  if (booking.isError) {
    if (booking.error instanceof ApiError && (booking.error.status === 404 || booking.error.status === 403)) {
      return <BookingNotFound />
    }
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Couldn&apos;t load this booking</AlertTitle>
        <AlertDescription>
          <p>{getErrorMessage(booking.error)}</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={() => booking.refetch()}>
            <RotateCwIcon data-icon="inline-start" aria-hidden />
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const data = booking.data
  if (!data) return <DashboardSkeleton />

  const meta = statusMeta(data, now)
  const awaitingPayment = data.status === "APPROVED" && !!data.holdExpiresAt && !isHoldExpired(data, now)

  const details = [
    { icon: SproutIcon, label: "Crop", value: data.cropType.name },
    { icon: PackageIcon, label: "Quantity", value: `${formatNumber(data.quantityKg)} kg` },
    {
      icon: SnowflakeIcon,
      label: "Chamber",
      value: `${data.chamber.name} · ${formatTempRange(data.chamber.minTempC, data.chamber.maxTempC)}`,
    },
    {
      icon: CalendarDaysIcon,
      label: "Dates",
      value: `${format(parseISO(data.startDate), "MMM d")} to ${format(parseISO(data.endDate), "MMM d, yyyy")} · ${data.bookedDays} days`,
    },
    { icon: TagIcon, label: "Rate", value: `${formatMoney(data.ratePerKgPerDay, { maximumFractionDigits: 3 })} /kg/day` },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Button variant="ghost" size="sm" className="-ml-2 w-fit rounded-full text-muted-foreground" asChild>
          <Link href="/farmer/bookings">
            <ArrowLeftIcon data-icon="inline-start" aria-hidden />
            My bookings
          </Link>
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Lot {data.lotCode}</h1>
              <StatusBadge booking={data} now={now} />
            </div>
            <p className="text-sm text-muted-foreground">
              Requested on {format(parseISO(data.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <BookingActions booking={data} invoice={invoice.data} />
        </div>
        {data.status === "PAID" && (
          <p className="text-xs text-muted-foreground">
            Paid bookings can&apos;t be cancelled here. Contact support at support@agrostore.com for a refund.
          </p>
        )}
      </div>

      <div className={cn("flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between", STATUS_TONE_CLASS[meta.tone])}>
        <p className="flex items-center gap-2 text-sm font-medium">
          <meta.icon className="size-5 shrink-0" aria-hidden />
          {meta.farmerHint}
        </p>
        {awaitingPayment && data.holdExpiresAt && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="flex items-center gap-2 text-sm">
              Hold ends in <HoldCountdown expiresAt={data.holdExpiresAt} />
            </p>
            <PayButton bookingId={data.id} amount={data.estimatedCost} />
          </div>
        )}
      </div>

      {data.cancelReason && (
        <Alert>
          <AlertCircleIcon />
          <AlertTitle>Reason</AlertTitle>
          <AlertDescription>{data.cancelReason}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="progress-heading" className="flex flex-col gap-5 rounded-3xl border border-soil/10 bg-card p-5 sm:p-6">
            <h2 id="progress-heading" className="font-display text-xl font-semibold">
              Progress
            </h2>
            <BookingTimeline booking={data} payment={invoice.data?.payment} now={now} />
          </section>

          <section aria-labelledby="lot-heading" className="flex flex-col gap-4 rounded-3xl border border-soil/10 bg-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="lot-heading" className="font-display text-xl font-semibold">
                  {data.warehouse.name}
                </h2>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPinIcon className="size-4" aria-hidden />
                  {data.warehouse.district}
                </p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full" asChild>
                <Link href={`/warehouses/${data.warehouse.id}`}>View warehouse</Link>
              </Button>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              {details.map((item) => (
                <div key={item.label} className="flex items-start gap-3 rounded-2xl bg-cream/60 p-3 dark:bg-muted/40">
                  <item.icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{item.label}</dt>
                    <dd className="font-medium">{item.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          {invoice.isError ? (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Couldn&apos;t load charges</AlertTitle>
              <AlertDescription>{getErrorMessage(invoice.error)}</AlertDescription>
            </Alert>
          ) : (
            <BookingCharges invoice={invoice.data} closed={meta.tone === "closed"} />
          )}
        </aside>
      </div>
    </div>
  )
}
