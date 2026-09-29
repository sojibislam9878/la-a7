"use client"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { format, parseISO } from "date-fns"
import {
  AlertCircleIcon,
  ArrowUpDownIcon,
  CreditCardIcon,
  FileTextIcon,
  RotateCwIcon,
  ShieldCheckIcon,
  WalletIcon,
} from "lucide-react"

import { PageHeader } from "@/components/dashboard/page-header"
import { PaymentStatusBadge } from "@/components/payment/payment-status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { PageLinks } from "@/components/shared/page-links"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PAYMENT_STATUS_FILTERS } from "@/constants/payment-status"
import { useDashboardSummary } from "@/hooks/use-dashboard"
import { useMyPayments } from "@/hooks/use-payments"
import { getErrorMessage } from "@/lib/api/form-errors"
import { formatMoney, formatNumber } from "@/lib/format"
import {
  DEFAULT_PAYMENT_SORT,
  PAYMENT_SORT_OPTIONS,
  type PaymentListState,
  parsePaymentListState,
  serializePaymentListState,
  toPaymentListQuery,
} from "@/lib/payment-query"
import { cn } from "@/lib/utils"
import type { Payment } from "@/types/payment"

const hasReceipt = (payment: Payment) => payment.status === "SUCCEEDED" || payment.status === "REFUNDED"

const paymentDate = (payment: Payment) => format(parseISO(payment.paidAt ?? payment.createdAt), "MMM d, yyyy")

const cardCharge = (payment: Payment) => `${payment.amount.toFixed(2)} ${payment.currency.toUpperCase()}`

function PaymentLink({ payment, className }: { payment: Payment; className?: string }) {
  return hasReceipt(payment) ? (
    <Button variant="outline" size="sm" className={cn("rounded-full", className)} asChild>
      <Link href={`/farmer/bookings/${payment.bookingId}/invoice`}>
        <FileTextIcon data-icon="inline-start" aria-hidden />
        Receipt
      </Link>
    </Button>
  ) : (
    <Button variant="ghost" size="sm" className={cn("rounded-full", className)} asChild>
      <Link href={`/farmer/bookings/${payment.bookingId}`}>View booking</Link>
    </Button>
  )
}

function DateNote({ payment }: { payment: Payment }) {
  if (payment.status === "REFUNDED" && payment.refundedAt) {
    return (
      <p className="text-xs text-muted-foreground">Refunded {format(parseISO(payment.refundedAt), "MMM d, yyyy")}</p>
    )
  }
  return null
}

function TotalPaid() {
  const dashboard = useDashboardSummary()
  const total = dashboard.data?.role === "FARMER" ? dashboard.data.totalSpentBdt : null

  return (
    <section
      aria-label="Payment summary"
      className="relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-forest p-6 text-forest-foreground sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-[55%_45%_50%_50%/60%_50%_50%_40%] bg-harvest text-harvest-foreground">
          <WalletIcon className="size-6" aria-hidden />
        </span>
        <div>
          <p className="text-sm text-forest-foreground/75">Total paid for storage</p>
          {total === null ? (
            <Skeleton className="mt-1 h-9 w-32 bg-forest-foreground/15" />
          ) : (
            <p className="font-display text-3xl font-semibold tracking-tight">{formatMoney(total)}</p>
          )}
        </div>
      </div>
      <p className="flex max-w-xs items-start gap-2 text-sm text-forest-foreground/75">
        <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-harvest" aria-hidden />
        Card payments are processed securely by Stripe. Refunds go back to the same card.
      </p>
    </section>
  )
}

export function MyPayments() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.toString()
  const state = useMemo(() => parsePaymentListState(new URLSearchParams(current)), [current])
  const query = useMemo(() => toPaymentListQuery(state), [state])
  const payments = useMyPayments(query)

  const hrefFor = (next: PaymentListState) => {
    const qs = serializePaymentListState(next)
    return qs ? `${pathname}?${qs}` : pathname
  }

  const data = payments.data
  const filtered = !!state.status

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader title="Payments" description="Every Stripe payment for your storage lots, with receipts." />

      <TotalPaid />

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Filter by status" className="-mx-1 min-w-0 overflow-x-auto px-1 pb-1 sm:flex-1">
          <ul className="flex w-max gap-1.5">
            {PAYMENT_STATUS_FILTERS.map((filter) => {
              const active = (state.status ?? "ALL") === filter.value
              return (
                <li key={filter.value}>
                  <Link
                    href={hrefFor({ ...state, status: filter.value === "ALL" ? undefined : filter.value, page: undefined })}
                    replace
                    scroll={false}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-9 items-center rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-soil/15 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    {filter.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <Select
          value={state.sort ?? DEFAULT_PAYMENT_SORT}
          onValueChange={(sort) =>
            router.replace(hrefFor({ ...state, sort: sort as PaymentListState["sort"], page: undefined }), {
              scroll: false,
            })
          }
        >
          <SelectTrigger
            aria-label="Sort payments"
            className="h-10! w-full shrink-0 rounded-xl border-soil/15 bg-card text-left sm:w-44 *:data-[slot=select-value]:grow"
          >
            <ArrowUpDownIcon aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" position="popper">
            {PAYMENT_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {payments.isError ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Couldn&apos;t load your payments</AlertTitle>
          <AlertDescription>
            <p>{getErrorMessage(payments.error)}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => payments.refetch()}>
              <RotateCwIcon data-icon="inline-start" aria-hidden />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : !data ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading payments">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={CreditCardIcon}
          title={filtered ? "No payments with this status" : "No payments yet"}
          description={
            filtered
              ? "Try another status, or see all your payments."
              : "Once a warehouse owner approves a booking, pay for it here to confirm your space."
          }
          action={
            <Button variant={filtered ? "outline" : "default"} className="rounded-full" asChild>
              <Link href={filtered ? pathname : "/farmer/bookings"}>
                {filtered ? "Show all payments" : "Go to my bookings"}
              </Link>
            </Button>
          }
        />
      ) : (
        <div className={cn("flex flex-col gap-4 transition-opacity", payments.isPlaceholderData && "opacity-60")}>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {formatNumber(data.meta.total)} {data.meta.total === 1 ? "payment" : "payments"}
          </p>

          <div className="hidden overflow-hidden rounded-2xl border border-soil/10 bg-card md:block">
            <table className="w-full text-sm">
              <thead className="bg-cream/60 dark:bg-muted/30">
                <tr className="text-left text-xs text-muted-foreground uppercase">
                  <th scope="col" className="px-5 py-3 font-semibold">Date</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Lot</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Amount</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soil/10">
                {data.items.map((payment) => (
                  <tr key={payment.id} className="transition-colors hover:bg-cream/40 dark:hover:bg-muted/20">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-medium">{paymentDate(payment)}</p>
                      <DateNote payment={payment} />
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/farmer/bookings/${payment.bookingId}`}
                        className="font-mono font-semibold underline-offset-4 hover:text-primary hover:underline"
                      >
                        {payment.lotCode}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <PaymentStatusBadge status={payment.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="font-semibold tabular-nums">{formatMoney(payment.amountBdt)}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">Card: {cardCharge(payment)}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <PaymentLink payment={payment} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 md:hidden">
            {data.items.map((payment) => (
              <li key={payment.id} className="flex flex-col gap-3 rounded-2xl border border-soil/10 bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/farmer/bookings/${payment.bookingId}`}
                      className="font-mono text-sm font-semibold hover:text-primary"
                    >
                      {payment.lotCode}
                    </Link>
                    <p className="text-xs text-muted-foreground">{paymentDate(payment)}</p>
                    <DateNote payment={payment} />
                  </div>
                  <PaymentStatusBadge status={payment.status} />
                </div>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xl font-bold tabular-nums">{formatMoney(payment.amountBdt)}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">Card: {cardCharge(payment)}</p>
                  </div>
                  <PaymentLink payment={payment} />
                </div>
              </li>
            ))}
          </ul>

          <PageLinks
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            hrefFor={(page) => hrefFor({ ...state, page })}
            scroll={false}
          />
        </div>
      )}
    </div>
  )
}
