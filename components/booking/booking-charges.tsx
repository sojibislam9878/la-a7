import { format, parseISO } from "date-fns"
import { CreditCardIcon, ReceiptIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { formatMoney, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { BookingInvoice, PaymentStatus } from "@/types/booking"

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  PENDING: "Payment started",
  SUCCEEDED: "Paid",
  FAILED: "Payment failed",
  REFUNDED: "Refunded",
}

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className={cn("text-muted-foreground", strong && "font-medium text-foreground")}>{label}</dt>
      <dd className={cn("text-right", strong && "font-semibold", muted && "text-muted-foreground")}>{value}</dd>
    </div>
  )
}

export function BookingCharges({ invoice, closed = false }: { invoice: BookingInvoice | undefined; closed?: boolean }) {
  if (!invoice) {
    return (
      <div className="flex flex-col gap-3 rounded-3xl border border-soil/10 bg-card p-5 sm:p-6" aria-busy="true">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  const { charges, payment, balanceBdt } = invoice
  const settlement = charges.settlement
  const rate = formatMoney(charges.ratePerKgPerDay, { maximumFractionDigits: 3 })

  return (
    <section aria-labelledby="charges-heading" className="flex flex-col gap-4 rounded-3xl border border-soil/10 bg-card p-5 sm:p-6">
      <h2 id="charges-heading" className="flex items-center gap-2 font-display text-xl font-semibold">
        <ReceiptIcon className="size-5 text-primary" aria-hidden />
        Charges
      </h2>

      <dl className="flex flex-col gap-2 text-sm">
        <Row
          label="Estimate"
          value={`${formatNumber(charges.quantityKg)} kg × ${rate} × ${charges.bookedDays} days`}
          muted
        />
        <Row label="Estimated cost" value={formatMoney(charges.estimatedCostBdt)} strong />
      </dl>

      {settlement && (
        <dl className="flex flex-col gap-2 border-t border-soil/10 pt-4 text-sm">
          <Row label="Days stored" value={`${charges.actualDaysStored} days`} />
          <Row
            label="Billable days"
            value={`${settlement.billableDays} days${settlement.billableDays > (charges.actualDaysStored ?? 0) ? ` (minimum ${charges.minBookingDays})` : ""}`}
          />
          <Row label="Storage cost" value={formatMoney(settlement.baseCost)} />
          {settlement.overstayDays > 0 && (
            <Row label={`Overstay, ${settlement.overstayDays} days at 1.5×`} value={formatMoney(settlement.surcharge)} />
          )}
          <Row
            label={charges.finalCostBdt !== null ? "Final cost" : "Cost so far"}
            value={formatMoney(charges.finalCostBdt ?? settlement.finalCost)}
            strong
          />
        </dl>
      )}

      <div className="flex flex-col gap-2 border-t border-soil/10 pt-4 text-sm">
        {payment ? (
          <>
            <p className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-medium">
                <CreditCardIcon className="size-4 text-muted-foreground" aria-hidden />
                {PAYMENT_LABEL[payment.status]}
              </span>
              <span className="font-semibold">{formatMoney(payment.amountBdt)}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Charged {payment.amountCharged.toFixed(2)} {payment.currency.toUpperCase()} by Stripe
              {payment.paidAt ? ` on ${format(parseISO(payment.paidAt), "MMM d, yyyy")}` : ""}
            </p>
          </>
        ) : (
          <p className="flex items-center gap-2 text-muted-foreground">
            <CreditCardIcon className="size-4" aria-hidden />
            No payment yet
          </p>
        )}
      </div>

      {closed && !payment ? (
        <p className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          This booking closed before payment, so nothing is owed.
        </p>
      ) : (
        <div
          className={cn(
            "flex items-center justify-between gap-3 rounded-2xl px-4 py-3",
            balanceBdt > 0 ? "bg-harvest/15" : "bg-primary/10"
          )}
        >
          <span className="text-sm font-medium">
            {balanceBdt > 0 ? "Balance due" : balanceBdt < 0 ? "Credit" : "Balance"}
          </span>
          <span className="text-xl font-bold">{formatMoney(Math.abs(balanceBdt))}</span>
        </div>
      )}
    </section>
  )
}
