import { format, parseISO } from "date-fns"
import { CheckIcon, XIcon } from "lucide-react"

import { isHoldExpired, LIFECYCLE, LIFECYCLE_LABEL, statusMeta } from "@/constants/booking-status"
import { cn } from "@/lib/utils"
import type { Booking, BookingInvoice } from "@/types/booking"

type Step = { key: string; label: string; state: "done" | "current" | "upcoming" | "stopped"; date?: string }

function stoppedAfter(booking: Booking, payment: BookingInvoice["payment"] | undefined, now: number) {
  if (booking.status === "REJECTED") return 0
  if (booking.status === "EXPIRED" || isHoldExpired(booking, now)) return 1
  if (booking.status === "CANCELLED") {
    if (payment && (payment.status === "SUCCEEDED" || payment.status === "REFUNDED")) return 2
    return booking.holdExpiresAt ? 1 : 0
  }
  return null
}

function buildSteps(booking: Booking, payment: BookingInvoice["payment"] | undefined, now: number): Step[] {
  const dates: Partial<Record<(typeof LIFECYCLE)[number], string | null>> = {
    PENDING_APPROVAL: booking.createdAt,
    PAID: payment?.paidAt ?? null,
    STORED: booking.storedAt,
    COMPLETED: booking.withdrawnAt,
  }
  const stop = stoppedAfter(booking, payment, now)

  if (stop !== null) {
    const steps: Step[] = LIFECYCLE.slice(0, stop + 1).map((status) => ({
      key: status,
      label: LIFECYCLE_LABEL[status],
      state: "done",
      date: dates[status] ?? undefined,
    }))
    steps.push({ key: "stopped", label: statusMeta(booking, now).label, state: "stopped" })
    return steps
  }

  const currentIndex = LIFECYCLE.indexOf(booking.status as (typeof LIFECYCLE)[number])
  return LIFECYCLE.map((status, index) => ({
    key: status,
    label: LIFECYCLE_LABEL[status],
    state:
      index < currentIndex || booking.status === "COMPLETED" ? "done" : index === currentIndex ? "current" : "upcoming",
    date: dates[status] ?? undefined,
  }))
}

export function BookingTimeline({
  booking,
  payment,
  now,
}: {
  booking: Booking
  payment?: BookingInvoice["payment"]
  now: number
}) {
  const steps = buildSteps(booking, payment, now)

  return (
    <div className="@container">
      <ol className="flex flex-col gap-0 @2xl:flex-row @2xl:items-start" aria-label="Booking progress">
        {steps.map((step, index) => (
          <li
            key={step.key}
            aria-current={step.state === "current" ? "step" : undefined}
            className="relative flex flex-1 gap-3 pb-6 last:pb-0 @2xl:flex-col @2xl:items-center @2xl:gap-2 @2xl:pb-0 @2xl:text-center"
          >
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-8 left-[0.9375rem] h-[calc(100%-2rem)] w-0.5 @2xl:top-[0.9375rem] @2xl:left-[calc(50%+1rem)] @2xl:h-0.5 @2xl:w-[calc(100%-2rem)]",
                  step.state === "done" ? "bg-primary" : "bg-soil/15"
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                step.state === "done" && "border-primary bg-primary text-primary-foreground",
                step.state === "current" && "border-primary bg-card text-primary ring-4 ring-primary/15",
                step.state === "upcoming" && "border-soil/20 bg-card text-muted-foreground",
                step.state === "stopped" && "border-destructive bg-destructive text-white"
              )}
            >
              {step.state === "done" ? (
                <CheckIcon className="size-4" aria-hidden />
              ) : step.state === "stopped" ? (
                <XIcon className="size-4" aria-hidden />
              ) : (
                index + 1
              )}
            </span>
            <span className="flex flex-col pt-1 @2xl:pt-0">
              <span
                className={cn(
                  "text-sm font-medium",
                  step.state === "upcoming" && "text-muted-foreground",
                  step.state === "stopped" && "text-destructive"
                )}
              >
                {step.label}
              </span>
              {step.date && (
                <time dateTime={step.date} className="text-xs text-muted-foreground">
                  {format(parseISO(step.date), "MMM d")}
                </time>
              )}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
