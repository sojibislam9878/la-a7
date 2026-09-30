"use client"

import { useCallback, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { format, parseISO } from "date-fns"
import { AlertCircleIcon, ArrowUpDownIcon, CreditCardIcon, RotateCwIcon, TriangleAlertIcon } from "lucide-react"

import { RefundDialog } from "@/components/admin/payments/refund-dialog"
import { PageHeader } from "@/components/dashboard/page-header"
import { PaymentStatusBadge } from "@/components/payment/payment-status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { PageLinks } from "@/components/shared/page-links"
import { UrlSearchInput } from "@/components/shared/url-search-input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { BOOKING_STAGE_NOTE } from "@/constants/payment-status"
import { useAdminPayments } from "@/hooks/use-admin-payments"
import {
  ADMIN_PAYMENT_VIEWS,
  type AdminPaymentListState,
  parseAdminPaymentState,
  serializeAdminPaymentState,
  toAdminPaymentQuery,
} from "@/lib/admin-payment-query"
import { getErrorMessage } from "@/lib/api/form-errors"
import { formatMoney, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { AdminPayment } from "@/types/admin"

const SORT_OPTIONS = [
  { value: "desc", label: "Newest first" },
  { value: "asc", label: "Oldest first" },
] as const

const refundDue = (payment: AdminPayment) => payment.refundable && payment.booking.status === "CANCELLED"

const paymentDate = (payment: AdminPayment) => format(parseISO(payment.paidAt ?? payment.createdAt), "MMM d, yyyy")

const cardCharge = (payment: AdminPayment) => `${payment.amount.toFixed(2)} ${payment.currency.toUpperCase()}`

function BookingNote({ payment }: { payment: AdminPayment }) {
  if (refundDue(payment)) {
    return (
      <p className="flex items-center gap-1 text-xs font-medium whitespace-nowrap text-harvest-foreground dark:text-harvest">
        <TriangleAlertIcon className="size-3.5 shrink-0" aria-hidden />
        Booking cancelled, refund due
      </p>
    )
  }
  if (payment.status === "REFUNDED" && payment.refundedAt) {
    return (
      <p className="text-xs text-muted-foreground">Refunded {format(parseISO(payment.refundedAt), "MMM d, yyyy")}</p>
    )
  }
  return <p className="text-xs text-muted-foreground">{BOOKING_STAGE_NOTE[payment.booking.status]}</p>
}

function Actions({ payment }: { payment: AdminPayment }) {
  if (payment.refundable) return <RefundDialog payment={payment} />
  if (payment.status === "SUCCEEDED") {
    return <span className="text-xs text-muted-foreground">No card on record</span>
  }
  return null
}

export function AdminPayments() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.toString()
  const state = useMemo(() => parseAdminPaymentState(new URLSearchParams(current)), [current])
  const query = useMemo(() => toAdminPaymentQuery(state), [state])
  const payments = useAdminPayments(query)
  const dueCount = useAdminPayments({ refundDue: "true", limit: 1 }).data?.meta.total

  const hrefFor = (next: AdminPaymentListState) => {
    const qs = serializeAdminPaymentState(next)
    return qs ? `${pathname}?${qs}` : pathname
  }

  const commitSearch = useCallback(
    (q: string) => {
      const next = { ...parseAdminPaymentState(new URLSearchParams(current)), q: q || undefined, page: undefined }
      const qs = serializeAdminPaymentState(next)
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [current, pathname, router]
  )

  const data = payments.data
  const narrowed = !!(state.view || state.q)

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title="Payments"
        description="Every Stripe payment on the platform. Refund farmers whose paid bookings were cancelled."
      />

      <nav aria-label="Filter payments" className="-mx-1 min-w-0 overflow-x-auto px-1 pb-1">
        <ul className="flex w-max gap-1.5">
          {ADMIN_PAYMENT_VIEWS.map((view) => {
            const active = (state.view ?? "ALL") === view.value
            return (
              <li key={view.value}>
                <Link
                  href={hrefFor({ ...state, view: view.value === "ALL" ? undefined : view.value, page: undefined })}
                  replace
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-soil/15 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {view.label}
                  {view.value === "REFUND_DUE" && !!dueCount && (
                    <span
                      className={cn(
                        "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold tabular-nums",
                        active ? "bg-primary-foreground/20" : "bg-harvest text-harvest-foreground"
                      )}
                    >
                      {formatNumber(dueCount)}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        <UrlSearchInput
          id="admin-payment-search"
          urlValue={state.q ?? ""}
          onCommit={commitSearch}
          label="Search payments by lot code, farmer name or email"
          placeholder="Search lot code, farmer name or email"
          className="w-full min-w-60 sm:w-auto sm:flex-1"
        />
        <Select
          value={state.sort ?? "desc"}
          onValueChange={(sort) =>
            router.replace(hrefFor({ ...state, sort: sort as AdminPaymentListState["sort"], page: undefined }), {
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
            {SORT_OPTIONS.map((option) => (
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
          <AlertTitle>Couldn&apos;t load payments</AlertTitle>
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
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={CreditCardIcon}
          title={state.view === "REFUND_DUE" && !state.q ? "No refunds due" : narrowed ? "No matching payments" : "No payments yet"}
          description={
            state.view === "REFUND_DUE" && !state.q
              ? "Every cancelled booking that was paid for has been refunded."
              : narrowed
                ? "Try another filter or search term."
                : "Payments appear here once farmers pay for approved bookings."
          }
          action={
            narrowed ? (
              <Button variant="outline" className="rounded-full" asChild>
                <Link href={pathname}>Show all payments</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className={cn("flex flex-col gap-4 transition-opacity", payments.isPlaceholderData && "opacity-60")}>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {formatNumber(data.meta.total)} {data.meta.total === 1 ? "payment" : "payments"}
          </p>

          <div className="hidden overflow-x-auto rounded-2xl border border-soil/10 bg-card lg:block">
            <table className="w-full text-sm">
              <thead className="bg-cream/60 dark:bg-muted/30">
                <tr className="text-left text-xs text-muted-foreground uppercase">
                  <th scope="col" className="px-5 py-3 font-semibold">Date</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Lot</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Farmer</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Amount</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soil/10">
                {data.items.map((payment) => (
                  <tr
                    key={payment.id}
                    className={cn(
                      "transition-colors hover:bg-cream/40 dark:hover:bg-muted/20",
                      refundDue(payment) && "bg-harvest/5"
                    )}
                  >
                    <td className="px-5 py-4 font-medium whitespace-nowrap">{paymentDate(payment)}</td>
                    <td className="px-5 py-4">
                      <p className="font-mono font-semibold">{payment.lotCode}</p>
                      <BookingNote payment={payment} />
                    </td>
                    <td className="max-w-56 px-5 py-4">
                      <Link
                        href={`/admin/users/${payment.booking.farmer.id}`}
                        className="block truncate font-medium underline-offset-4 hover:text-primary hover:underline"
                      >
                        {payment.booking.farmer.name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">{payment.booking.warehouse.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <PaymentStatusBadge status={payment.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="font-semibold tabular-nums">{formatMoney(payment.amountBdt)}</p>
                      <p className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">Card: {cardCharge(payment)}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Actions payment={payment} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 lg:hidden">
            {data.items.map((payment) => (
              <li
                key={payment.id}
                className={cn(
                  "flex flex-col gap-3 rounded-2xl border bg-card p-4",
                  refundDue(payment) ? "border-harvest/50" : "border-soil/10"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold">{payment.lotCode}</p>
                    <p className="text-xs text-muted-foreground">{paymentDate(payment)}</p>
                    <BookingNote payment={payment} />
                  </div>
                  <PaymentStatusBadge status={payment.status} />
                </div>
                <p className="min-w-0 text-sm">
                  <Link href={`/admin/users/${payment.booking.farmer.id}`} className="font-medium hover:text-primary">
                    {payment.booking.farmer.name}
                  </Link>
                  <span className="text-muted-foreground"> at {payment.booking.warehouse.name}</span>
                </p>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xl font-bold tabular-nums">{formatMoney(payment.amountBdt)}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">Card: {cardCharge(payment)}</p>
                  </div>
                  <Actions payment={payment} />
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
