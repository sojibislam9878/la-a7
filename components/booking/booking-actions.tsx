"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { BanIcon, FileTextIcon, Loader2Icon, LogOutIcon } from "lucide-react"
import { useForm } from "react-hook-form"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { useCancelBooking, useRequestWithdrawal } from "@/hooks/use-booking-actions"
import { formatMoney } from "@/lib/format"
import { type CancelBookingValues, cancelBookingSchema } from "@/schemas/booking"
import type { Booking, BookingInvoice } from "@/types/booking"

const CANCELLABLE = new Set<Booking["status"]>(["PENDING_APPROVAL", "APPROVED"])

export function BookingActions({ booking, invoice }: { booking: Booking; invoice?: BookingInvoice }) {
  const canCancel = CANCELLABLE.has(booking.status)
  const canWithdraw = booking.status === "STORED"

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" className="rounded-full" asChild>
        <Link href={`/farmer/bookings/${booking.id}/invoice`}>
          <FileTextIcon data-icon="inline-start" aria-hidden />
          Invoice
        </Link>
      </Button>
      {canWithdraw && <WithdrawDialog booking={booking} invoice={invoice} />}
      {canCancel && <CancelDialog booking={booking} />}
    </div>
  )
}

function CancelDialog({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false)
  const cancel = useCancelBooking()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CancelBookingValues>({
    resolver: zodResolver(cancelBookingSchema),
    defaultValues: { reason: "" },
  })

  const onSubmit = handleSubmit(({ reason }) => {
    setOpen(false)
    cancel.mutate({ id: booking.id, lotCode: booking.lotCode, reason: reason || undefined })
    reset()
  })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="rounded-full" disabled={cancel.isPending}>
          {cancel.isPending ? (
            <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />
          ) : (
            <BanIcon data-icon="inline-start" aria-hidden />
          )}
          Cancel booking
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel lot {booking.lotCode}?</AlertDialogTitle>
            <AlertDialogDescription>
              The space goes back to other farmers straight away. You can&apos;t undo this, but you can always book
              again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Field data-invalid={!!errors.reason || undefined}>
            <FieldLabel htmlFor="cancel-reason">
              Reason <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Textarea
              id="cancel-reason"
              rows={3}
              placeholder="Harvest came in smaller than expected"
              aria-invalid={!!errors.reason}
              {...register("reason")}
            />
            <FieldDescription>Shared with the warehouse owner.</FieldDescription>
            <FieldError errors={[errors.reason]} />
          </Field>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Keep booking</AlertDialogCancel>
            <Button type="submit" variant="destructive">
              Cancel booking
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function WithdrawDialog({ booking, invoice }: { booking: Booking; invoice?: BookingInvoice }) {
  const [open, setOpen] = useState(false)
  const withdraw = useRequestWithdrawal()
  const settlement = invoice?.charges.settlement

  const confirm = () => {
    setOpen(false)
    withdraw.mutate({ id: booking.id, lotCode: booking.lotCode })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" className="rounded-full" disabled={withdraw.isPending}>
          {withdraw.isPending ? (
            <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />
          ) : (
            <LogOutIcon data-icon="inline-start" aria-hidden />
          )}
          Request withdrawal
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Collect lot {booking.lotCode}?</AlertDialogTitle>
          <AlertDialogDescription>
            The warehouse owner will prepare your produce for pickup and settle the final bill on the days actually
            stored. Leaving early still pays the minimum stay, and days past your end date cost 1.5×.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {settlement && (
          <dl className="flex flex-col gap-1.5 rounded-2xl bg-cream/70 p-4 text-sm dark:bg-muted/40">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Days stored so far</dt>
              <dd className="font-medium">{invoice?.charges.actualDaysStored} days</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Cost if collected today</dt>
              <dd className="font-semibold">{formatMoney(settlement.finalCost)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{settlement.balance > 0 ? "Left to pay" : "Credit"}</dt>
              <dd className="font-semibold">{formatMoney(Math.abs(settlement.balance))}</dd>
            </div>
          </dl>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Not yet</AlertDialogCancel>
          <Button onClick={confirm}>Request withdrawal</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
