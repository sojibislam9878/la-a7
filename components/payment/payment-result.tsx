"use client"

import { useState } from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import {
  ArrowRightIcon,
  CheckIcon,
  CircleSlashIcon,
  HourglassIcon,
  Loader2Icon,
  RotateCcwIcon,
  RotateCwIcon,
  SearchXIcon,
  XIcon,
} from "lucide-react"

import { PayButton } from "@/components/payment/pay-button"
import { Leaf } from "@/components/shared/leaf"
import { Button } from "@/components/ui/button"
import { useNow } from "@/hooks/use-now"
import { PAYMENT_POLL_LIMIT_MS, usePaymentStatus } from "@/hooks/use-payments"
import { ApiError } from "@/lib/api/client"
import { getErrorMessage } from "@/lib/api/form-errors"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Payment } from "@/types/payment"

type Outcome = "success" | "processing" | "delayed" | "cancelled" | "failed" | "refunded"

const OUTCOME: Record<
  Outcome,
  { title: string; description: string; icon: typeof CheckIcon; badge: string; spin?: boolean }
> = {
  success: {
    title: "Payment successful",
    description: "Your storage is confirmed. Bring your produce in on your start date for quality grading.",
    icon: CheckIcon,
    badge: "bg-primary text-primary-foreground shadow-primary/30",
  },
  processing: {
    title: "Confirming your payment",
    description: "Stripe has your payment. We're waiting for the confirmation, this usually takes a few seconds.",
    icon: Loader2Icon,
    badge: "bg-sky-500 text-white shadow-sky-500/30",
    spin: true,
  },
  delayed: {
    title: "Still confirming",
    description:
      "The confirmation is taking longer than usual. Your booking updates automatically once it arrives, so there's no need to pay again.",
    icon: HourglassIcon,
    badge: "bg-harvest text-harvest-foreground shadow-harvest/30",
  },
  cancelled: {
    title: "Payment not completed",
    description: "You left the checkout before paying. Your booking is unchanged and still held until its payment window ends.",
    icon: CircleSlashIcon,
    badge: "bg-harvest text-harvest-foreground shadow-harvest/30",
  },
  failed: {
    title: "Payment failed",
    description: "The payment didn't go through and you were not charged. You can try again while the hold lasts.",
    icon: XIcon,
    badge: "bg-destructive text-white shadow-destructive/30",
  },
  refunded: {
    title: "Payment refunded",
    description: "This payment was refunded to your card.",
    icon: RotateCcwIcon,
    badge: "bg-muted-foreground text-white shadow-black/20",
  },
}

function outcomeFor(payment: Payment, mode: "success" | "failed", timedOut: boolean): Outcome {
  if (payment.status === "SUCCEEDED") return "success"
  if (payment.status === "REFUNDED") return "refunded"
  if (payment.status === "FAILED") return "failed"
  if (mode === "failed") return "cancelled"
  return timedOut ? "delayed" : "processing"
}

export function PaymentResult({ sessionId, mode }: { sessionId: string | null; mode: "success" | "failed" }) {
  const [pollUntil] = useState(() => (mode === "success" ? Date.now() + PAYMENT_POLL_LIMIT_MS : null))
  const status = usePaymentStatus(sessionId, pollUntil)
  const now = useNow()

  if (!sessionId) {
    return (
      <ResultShell
        outcome={mode === "success" ? "processing" : "cancelled"}
        override={{ title: "Missing payment reference", description: "This page needs the link Stripe sends you back with." }}
        icon={SearchXIcon}
        actions={<BookingsLink />}
      />
    )
  }

  if (status.isError) {
    const notFound = status.error instanceof ApiError && status.error.status === 404
    return (
      <ResultShell
        outcome="failed"
        icon={notFound ? SearchXIcon : undefined}
        override={{
          title: notFound ? "Payment not found" : "Couldn't check this payment",
          description: notFound ? "We couldn't find a payment for this checkout session." : getErrorMessage(status.error),
        }}
        actions={
          <>
            {!notFound && (
              <Button variant="outline" size="lg" className="h-11 rounded-full" onClick={() => status.refetch()}>
                <RotateCwIcon data-icon="inline-start" aria-hidden />
                Try again
              </Button>
            )}
            <BookingsLink />
          </>
        }
      />
    )
  }

  const payment = status.data
  if (!payment) {
    return (
      <ResultShell
        outcome="processing"
        override={{ title: "Checking your payment", description: "One moment while we look up this checkout." }}
      />
    )
  }

  const timedOut = pollUntil !== null && now > pollUntil
  const outcome = outcomeFor(payment, mode, timedOut)
  const bookingHref = `/farmer/bookings/${payment.bookingId}`
  const canRetry = outcome === "cancelled" || outcome === "failed"

  return (
    <ResultShell
      outcome={outcome}
      payment={payment}
      actions={
        <>
          {canRetry && <PayButton bookingId={payment.bookingId} amount={payment.amountBdt} label="Try paying again" />}
          {outcome === "delayed" && (
            <Button variant="outline" size="lg" className="h-11 rounded-full" onClick={() => status.refetch()}>
              <RotateCwIcon data-icon="inline-start" aria-hidden />
              Check again
            </Button>
          )}
          <Button size="lg" variant={canRetry ? "outline" : "default"} className="h-11 rounded-full" asChild>
            <Link href={bookingHref}>
              View booking
              <ArrowRightIcon data-icon="inline-end" aria-hidden />
            </Link>
          </Button>
        </>
      }
    />
  )
}

function BookingsLink() {
  return (
    <Button size="lg" className="h-11 rounded-full" asChild>
      <Link href="/farmer/bookings">
        My bookings
        <ArrowRightIcon data-icon="inline-end" aria-hidden />
      </Link>
    </Button>
  )
}

function ResultShell({
  outcome,
  payment,
  actions,
  override,
  icon,
}: {
  outcome: Outcome
  payment?: Payment
  actions?: React.ReactNode
  override?: { title: string; description: string }
  icon?: typeof CheckIcon
}) {
  const meta = OUTCOME[outcome]
  const Icon = icon ?? meta.icon
  const spin = !icon && meta.spin

  const rows = payment
    ? [
        { label: "Lot", value: payment.lotCode },
        { label: "Amount", value: formatMoney(payment.amountBdt) },
        { label: "Charged by Stripe", value: `${payment.amount.toFixed(2)} ${payment.currency.toUpperCase()}` },
        ...(payment.paidAt ? [{ label: "Paid on", value: format(parseISO(payment.paidAt), "MMM d, yyyy 'at' h:mm a") }] : []),
      ]
    : []

  return (
    <div className="relative isolate overflow-hidden bg-cream bg-grain">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 -z-10 size-[26rem] rounded-[42%_58%_63%_37%/45%_40%_60%_55%] bg-harvest/20 blur-2xl"
      />
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-4 py-16 text-center sm:py-24" role="status" aria-live="polite">
        <div className="relative">
          <Leaf className="absolute -top-4 -left-9 size-10 -rotate-45 text-primary/40" />
          <Leaf className="absolute -right-9 -bottom-2 size-9 rotate-[140deg] text-harvest/60" />
          <span
            className={cn(
              "flex size-20 items-center justify-center rounded-[58%_42%_52%_48%/55%_48%_52%_45%] shadow-xl",
              meta.badge
            )}
          >
            <Icon className={cn("size-9", spin && "animate-spin")} strokeWidth={3} aria-hidden />
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{override?.title ?? meta.title}</h1>
          <p className="text-muted-foreground">{override?.description ?? meta.description}</p>
        </div>

        {rows.length > 0 && (
          <dl className="w-full divide-y divide-soil/10 rounded-2xl border border-soil/10 bg-card text-left text-sm">
            {rows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="text-right font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {actions && <div className="flex flex-wrap justify-center gap-3">{actions}</div>}
      </div>
    </div>
  )
}
