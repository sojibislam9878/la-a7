"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircleIcon, CheckIcon, LogOutIcon, PackageCheckIcon, XIcon } from "lucide-react"
import { useForm } from "react-hook-form"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useBookingInvoice } from "@/hooks/use-bookings"
import { useApproveBooking, useCompleteBooking, useRejectBooking, useStoreBooking } from "@/hooks/use-owner-bookings"
import { getErrorMessage } from "@/lib/api/form-errors"
import { formatKg, formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"
import { type CancelBookingValues as RejectValues, cancelBookingSchema as rejectSchema } from "@/schemas/booking"
import type { Booking } from "@/types/booking"

export function OwnerBookingActions({ booking }: { booking: Booking }) {
  switch (booking.status) {
    case "PENDING_APPROVAL":
      return (
        <div className="flex flex-wrap gap-2">
          <ApproveButton booking={booking} />
          <RejectDialog booking={booking} />
        </div>
      )
    case "PAID":
      return <StoreButton booking={booking} />
    case "WITHDRAW_REQUESTED":
      return <CompleteDialog booking={booking} />
    default:
      return null
  }
}

function ApproveButton({ booking }: { booking: Booking }) {
  const approve = useApproveBooking()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" className="rounded-full">
          <CheckIcon data-icon="inline-start" aria-hidden />
          Approve
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve lot {booking.lotCode}?</AlertDialogTitle>
          <AlertDialogDescription>
            {formatKg(booking.quantityKg)} of {booking.cropType.name.toLowerCase()} in chamber {booking.chamber.name}. The
            space is held for 30 minutes while {booking.farmer.name} pays. If they don&apos;t, it frees up automatically.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Not yet</AlertDialogCancel>
          <AlertDialogAction onClick={() => approve.mutate({ id: booking.id, lotCode: booking.lotCode })}>
            Approve booking
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function RejectDialog({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false)
  const reject = useRejectBooking()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectValues>({ resolver: zodResolver(rejectSchema), defaultValues: { reason: "" } })

  const onSubmit = handleSubmit(({ reason }) => {
    setOpen(false)
    reject.mutate({ id: booking.id, lotCode: booking.lotCode, reason: reason || undefined })
    reset()
  })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" className="rounded-full">
          <XIcon data-icon="inline-start" aria-hidden />
          Reject
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Reject lot {booking.lotCode}?</AlertDialogTitle>
            <AlertDialogDescription>
              {booking.farmer.name} will see that the request was declined. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Field data-invalid={!!errors.reason || undefined}>
            <FieldLabel htmlFor={`reject-${booking.id}`}>
              Reason <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Textarea
              id={`reject-${booking.id}`}
              rows={3}
              placeholder="Chamber A-2 is reserved for a seed potato contract that week"
              aria-invalid={!!errors.reason}
              {...register("reason")}
            />
            <FieldDescription>Shared with the farmer so they can book elsewhere.</FieldDescription>
            <FieldError errors={[errors.reason]} />
          </Field>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Keep request</AlertDialogCancel>
            <Button type="submit" variant="destructive">
              Reject booking
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function StoreButton({ booking }: { booking: Booking }) {
  const store = useStoreBooking()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" className="rounded-full">
          <PackageCheckIcon data-icon="inline-start" aria-hidden />
          Mark stored
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Lot {booking.lotCode} received?</AlertDialogTitle>
          <AlertDialogDescription>
            Confirm that {formatKg(booking.quantityKg)} of {booking.cropType.name.toLowerCase()} is graded and in chamber{" "}
            {booking.chamber.name}. Billing counts from today, and lots that failed inspection can&apos;t be stored.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Not yet</AlertDialogCancel>
          <AlertDialogAction onClick={() => store.mutate({ id: booking.id, lotCode: booking.lotCode })}>
            Mark as stored
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function CompleteDialog({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false)
  const complete = useCompleteBooking()

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" className="rounded-full">
          <LogOutIcon data-icon="inline-start" aria-hidden />
          Release lot
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Release lot {booking.lotCode}?</AlertDialogTitle>
          <AlertDialogDescription>
            Hand the produce back to {booking.farmer.name}. The bill is settled on the days actually stored.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {open && <SettlementPreview bookingId={booking.id} />}
        <AlertDialogFooter>
          <AlertDialogCancel>Not yet</AlertDialogCancel>
          <AlertDialogAction onClick={() => complete.mutate({ id: booking.id, lotCode: booking.lotCode })}>
            Release and settle
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function SettlementPreview({ bookingId }: { bookingId: string }) {
  const invoice = useBookingInvoice(bookingId)

  if (invoice.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Couldn&apos;t load the bill</AlertTitle>
        <AlertDescription>{getErrorMessage(invoice.error)}</AlertDescription>
      </Alert>
    )
  }
  if (!invoice.data) return <Skeleton className="h-32 rounded-2xl" />

  const { charges, payment } = invoice.data
  const settlement = charges.settlement
  if (!settlement) return null
  const paid = payment?.status === "SUCCEEDED" ? payment.amountBdt : 0

  const rows = [
    { label: "Days stored", value: `${charges.actualDaysStored ?? settlement.billableDays} days` },
    ...(settlement.billableDays > (charges.actualDaysStored ?? 0)
      ? [{ label: "Billed (minimum stay)", value: `${settlement.billableDays} days` }]
      : []),
    ...(settlement.overstayDays > 0
      ? [{ label: `Overstay surcharge, ${settlement.overstayDays} days`, value: formatMoney(settlement.surcharge) }]
      : []),
    { label: "Final cost", value: formatMoney(settlement.finalCost) },
    { label: "Already paid", value: formatMoney(paid) },
  ]

  return (
    <dl className="flex flex-col gap-1.5 rounded-2xl bg-cream/70 p-4 text-sm dark:bg-muted/40">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="font-medium tabular-nums">{row.value}</dd>
        </div>
      ))}
      <div className="mt-1 flex justify-between gap-3 border-t border-soil/10 pt-2">
        <dt className="font-semibold">
          {settlement.balance > 0 ? "Collect from farmer" : settlement.balance < 0 ? "Refund to farmer" : "Balance"}
        </dt>
        <dd className={cn("font-bold tabular-nums", settlement.balance < 0 && "text-primary")}>
          {formatMoney(Math.abs(settlement.balance))}
        </dd>
      </div>
    </dl>
  )
}
