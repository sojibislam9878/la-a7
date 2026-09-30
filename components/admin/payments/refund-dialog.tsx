"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon, TriangleAlertIcon, Undo2Icon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { BOOKING_STAGE_NOTE } from "@/constants/payment-status"
import { useRefundPayment } from "@/hooks/use-admin-payments"
import { formatMoney } from "@/lib/format"
import type { AdminPayment } from "@/types/admin"

const refundSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(255, { error: "Keep it under 255 characters" })
    .refine((value): boolean => value.length === 0 || value.length >= 3, {
      error: "Write at least 3 characters, or leave it empty",
    }),
})

type RefundValues = z.infer<typeof refundSchema>

export function RefundDialog({ payment, className }: { payment: AdminPayment; className?: string }) {
  const [open, setOpen] = useState(false)
  const refund = useRefundPayment()
  const cancelled = payment.booking.status === "CANCELLED"
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RefundValues>({
    resolver: zodResolver(refundSchema),
    defaultValues: { reason: cancelled && payment.booking.cancelReason ? payment.booking.cancelReason : "" },
  })

  const onSubmit = handleSubmit((values) => {
    refund.mutate(
      { payment, reason: values.reason || undefined },
      {
        onSuccess: () => {
          setOpen(false)
          reset()
        },
      }
    )
  })

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (refund.isPending) return
        setOpen(next)
        if (!next) reset()
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant={cancelled ? "default" : "outline"} size="sm" className={className ?? "rounded-full"}>
          <Undo2Icon data-icon="inline-start" aria-hidden />
          Refund
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Refund {formatMoney(payment.amountBdt)} to {payment.booking.farmer.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Lot {payment.lotCode} at {payment.booking.warehouse.name}. Stripe returns the full{" "}
              {payment.amount.toFixed(2)} {payment.currency.toUpperCase()} to the card that paid. This can&apos;t be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {!cancelled && (
            <p className="flex items-start gap-2 rounded-2xl bg-harvest/15 p-3 text-sm text-harvest-foreground dark:text-harvest">
              <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              This booking isn&apos;t cancelled ({BOOKING_STAGE_NOTE[payment.booking.status].toLowerCase()}). Refunding
              doesn&apos;t cancel it, so the farmer keeps the space without paying.
            </p>
          )}

          <Field data-invalid={!!errors.reason || undefined}>
            <FieldLabel htmlFor={`refund-${payment.id}`}>
              Reason <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Textarea
              id={`refund-${payment.id}`}
              rows={3}
              placeholder={cancelled ? "Failed intake quality inspection" : "Charged twice by mistake"}
              aria-invalid={!!errors.reason}
              {...register("reason")}
            />
            <FieldDescription>Saved in the audit log.</FieldDescription>
            <FieldError errors={[errors.reason]} />
          </Field>

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={refund.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button type="submit" variant={cancelled ? "default" : "destructive"} disabled={refund.isPending}>
              {refund.isPending ? (
                <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />
              ) : (
                <Undo2Icon data-icon="inline-start" aria-hidden />
              )}
              {refund.isPending ? "Refunding" : "Refund payment"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
