"use client"

import Link from "next/link"
import { format, parseISO } from "date-fns"
import { AlertCircleIcon, ArrowLeftIcon, PrinterIcon, SnowflakeIcon } from "lucide-react"

import { StatusBadge } from "@/components/booking/status-badge"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useBookingInvoice } from "@/hooks/use-bookings"
import { useNow } from "@/hooks/use-now"
import { getErrorMessage } from "@/lib/api/form-errors"
import { formatMoney, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

type Line = { description: string; detail: string; amount: number }

export function BookingInvoiceView({ id }: { id: string }) {
  const invoice = useBookingInvoice(id)
  const now = useNow()

  if (invoice.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Couldn&apos;t load this invoice</AlertTitle>
        <AlertDescription>{getErrorMessage(invoice.error)}</AlertDescription>
      </Alert>
    )
  }
  if (!invoice.data) return <DashboardSkeleton />

  const { booking, charges, payment, balanceBdt } = invoice.data
  const settlement = charges.settlement
  const rate = formatMoney(charges.ratePerKgPerDay, { maximumFractionDigits: 3 })
  const settled = charges.finalCostBdt !== null

  const lines: Line[] = settlement
    ? [
        {
          description: `Cold storage, ${booking.cropType.name}`,
          detail: `${formatNumber(charges.quantityKg)} kg × ${rate} × ${settlement.billableDays} days${
            settlement.billableDays > (charges.actualDaysStored ?? 0) ? ` (minimum ${charges.minBookingDays})` : ""
          }`,
          amount: settlement.baseCost,
        },
        ...(settlement.overstayDays > 0
          ? [
              {
                description: "Overstay surcharge",
                detail: `${formatNumber(charges.quantityKg)} kg × ${rate} × ${settlement.overstayDays} days × 0.5`,
                amount: settlement.surcharge,
              },
            ]
          : []),
      ]
    : [
        {
          description: `Cold storage, ${booking.cropType.name} (estimate)`,
          detail: `${formatNumber(charges.quantityKg)} kg × ${rate} × ${charges.bookedDays} days`,
          amount: charges.estimatedCostBdt,
        },
      ]
  const total = settlement ? (charges.finalCostBdt ?? settlement.finalCost) : charges.estimatedCostBdt
  const paid = payment && (payment.status === "SUCCEEDED" || payment.status === "REFUNDED") ? payment : null

  return (
    <div className="flex flex-col gap-6">
      <div data-print="hide" className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="-ml-2 rounded-full text-muted-foreground" asChild>
          <Link href={`/farmer/bookings/${booking.id}`}>
            <ArrowLeftIcon data-icon="inline-start" aria-hidden />
            Back to lot {booking.lotCode}
          </Link>
        </Button>
        <Button className="rounded-full" onClick={() => window.print()}>
          <PrinterIcon data-icon="inline-start" aria-hidden />
          Print or save as PDF
        </Button>
      </div>

      <article className="mx-auto w-full max-w-3xl rounded-3xl border border-soil/10 bg-card p-6 shadow-sm sm:p-10 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex flex-col gap-6 border-b border-soil/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <SnowflakeIcon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-lg font-semibold">
                Agro<span className="text-primary">Store</span>
              </p>
              <p className="text-xs text-muted-foreground">Cold storage booking</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 sm:items-end sm:text-right">
            <h1 className="font-display text-3xl font-semibold">{settled ? "Invoice" : "Pro forma invoice"}</h1>
            <p className="font-mono text-sm">{booking.lotCode}</p>
            <p className="text-xs text-muted-foreground">
              Issued {now ? format(now, "MMM d, yyyy") : format(parseISO(booking.createdAt), "MMM d, yyyy")}
            </p>
            <StatusBadge booking={booking} now={now} className="mt-1 print:hidden" />
          </div>
        </header>

        <section className="grid gap-6 border-b border-soil/10 py-6 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Billed to</h2>
            <p className="mt-1 font-semibold">{booking.farmer.name}</p>
            {booking.farmer.phone && <p className="text-sm text-muted-foreground">{booking.farmer.phone}</p>}
          </div>
          <div className="sm:text-right">
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Stored at</h2>
            <p className="mt-1 font-semibold">{booking.warehouse.name}</p>
            <p className="text-sm text-muted-foreground">
              {booking.warehouse.district} · Chamber {booking.chamber.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(parseISO(booking.startDate), "MMM d")} to {format(parseISO(booking.endDate), "MMM d, yyyy")}
            </p>
          </div>
        </section>

        <div className="overflow-x-auto py-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-soil/10 text-left text-xs text-muted-foreground uppercase">
                <th scope="col" className="pb-2 font-semibold">Description</th>
                <th scope="col" className="pb-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.description} className="border-b border-soil/10">
                  <td className="py-3">
                    <p className="font-medium">{line.description}</p>
                    <p className="text-xs text-muted-foreground">{line.detail}</p>
                  </td>
                  <td className="py-3 pl-4 text-right font-medium whitespace-nowrap tabular-nums">{formatMoney(line.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="text-sm">
              <tr>
                <th scope="row" className="pt-4 text-right font-medium text-muted-foreground">
                  {settled ? "Total" : "Estimated total"}
                </th>
                <td className="pt-4 pl-4 text-right font-semibold whitespace-nowrap tabular-nums">{formatMoney(total)}</td>
              </tr>
              {paid && (
                <tr>
                  <th scope="row" className="pt-2 text-right font-medium text-muted-foreground">
                    {paid.status === "REFUNDED" ? "Paid, then refunded" : "Paid"}
                    {paid.paidAt ? ` on ${format(parseISO(paid.paidAt), "MMM d, yyyy")}` : ""}
                  </th>
                  <td className="pt-2 pl-4 text-right whitespace-nowrap tabular-nums">−{formatMoney(paid.amountBdt)}</td>
                </tr>
              )}
              <tr>
                <th scope="row" className="pt-4 text-right text-base font-semibold">
                  {balanceBdt < 0 ? "Credit" : "Balance due"}
                </th>
                <td
                  className={cn(
                    "pt-4 pl-4 text-right text-2xl font-bold whitespace-nowrap tabular-nums",
                    balanceBdt > 0 ? "text-foreground" : "text-primary"
                  )}
                >
                  {formatMoney(Math.abs(balanceBdt))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <footer className="flex flex-col gap-1 border-t border-soil/10 pt-6 text-xs text-muted-foreground">
          {paid && (
            <p>
              Card payment of {paid.amountCharged.toFixed(2)} {paid.currency.toUpperCase()} processed by Stripe at an
              exchange rate of {paid.fxRate}.
            </p>
          )}
          <p>
            Billing follows the days actually stored, never less than the {charges.minBookingDays}-day minimum. Days past the
            booked end date are charged at 1.5×.
          </p>
          <p>Questions about this invoice? support@agrostore.com</p>
        </footer>
      </article>
    </div>
  )
}
