"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ClipboardCheckIcon, Loader2Icon, TriangleAlertIcon } from "lucide-react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { inputClass } from "@/components/profile/account-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { STATUS_TONE_CLASS } from "@/constants/booking-status"
import { QUALITY_GRADE, QUALITY_GRADES } from "@/constants/quality-grade"
import { useRecordInspection } from "@/hooks/use-admin-bookings"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import { type InspectionValues, inspectionSchema } from "@/schemas/inspection"
import type { Booking, QualityGrade } from "@/types/booking"

function Variance({ declared, actual }: { declared: number; actual: string }) {
  if (!/^\d+$/.test(actual) || Number(actual) <= 0) return null
  const diff = Number(actual) - declared
  if (diff === 0) return <p className="text-xs text-muted-foreground">Matches the declared {formatNumber(declared)} kg.</p>
  const percent = Math.round((Math.abs(diff) / declared) * 1000) / 10
  return (
    <p className={cn("text-xs", Math.abs(percent) >= 10 ? "text-harvest-foreground dark:text-harvest" : "text-muted-foreground")}>
      {diff > 0 ? "+" : "−"}
      {formatNumber(Math.abs(diff))} kg ({percent}%) against the declared {formatNumber(declared)} kg.
    </p>
  )
}

export function InspectionDialog({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full">
          <ClipboardCheckIcon data-icon="inline-start" aria-hidden />
          Record inspection
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Intake inspection, lot {booking.lotCode}</DialogTitle>
          <DialogDescription>
            {booking.cropType.name} from {booking.farmer.name}, arriving at {booking.warehouse.name}. A lot can only be
            inspected once.
          </DialogDescription>
        </DialogHeader>
        {open && <InspectionForm booking={booking} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function InspectionForm({ booking, onDone }: { booking: Booking; onDone: () => void }) {
  const record = useRecordInspection()
  const {
    control,
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitted },
  } = useForm<InspectionValues>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: { grade: "", actualQtyKg: String(booking.quantityKg), moisturePct: "", notes: "" },
  })
  const [grade, actual] = useWatch({ control, name: ["grade", "actualQtyKg"] })
  const rejecting = grade === "REJECTED"

  const onSubmit = handleSubmit((values) => {
    record.mutate(
      {
        booking,
        payload: {
          grade: values.grade as QualityGrade,
          actualQtyKg: Number(values.actualQtyKg),
          ...(values.moisturePct ? { moisturePct: Number(values.moisturePct) } : {}),
          ...(values.notes ? { notes: values.notes } : {}),
        },
      },
      { onSuccess: onDone }
    )
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <FieldSet>
        <FieldLegend className="text-sm font-medium">Grade</FieldLegend>
        <Controller
          control={control}
          name="grade"
          render={({ field }) => (
            <RadioGroupPrimitive.Root
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value)
                if (isSubmitted) void trigger("notes")
              }}
              aria-invalid={!!errors.grade}
              className="grid gap-2 sm:grid-cols-2"
            >
              {QUALITY_GRADES.map((value) => {
                const meta = QUALITY_GRADE[value]
                return (
                  <RadioGroupPrimitive.Item
                    key={value}
                    value={value}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border border-soil/15 bg-card p-3 text-left transition-colors outline-none",
                      "hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50",
                      "data-[state=checked]:border-primary data-[state=checked]:bg-primary/5",
                      value === "REJECTED" && "data-[state=checked]:border-destructive data-[state=checked]:bg-destructive/5"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                        value === "REJECTED" ? "bg-destructive/15 text-destructive" : STATUS_TONE_CLASS[meta.tone]
                      )}
                      aria-hidden
                    >
                      {meta.short}
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold">{meta.label}</span>
                      <span className="text-xs text-muted-foreground">{meta.description}</span>
                    </span>
                  </RadioGroupPrimitive.Item>
                )
              })}
            </RadioGroupPrimitive.Root>
          )}
        />
        <FieldError errors={[errors.grade]} />
      </FieldSet>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.actualQtyKg || undefined}>
          <FieldLabel htmlFor="insp-qty">Weighed quantity</FieldLabel>
          <div className="relative">
            <Input
              id="insp-qty"
              inputMode="numeric"
              className={`${inputClass} pr-10`}
              aria-invalid={!!errors.actualQtyKg}
              {...register("actualQtyKg")}
            />
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden>
              kg
            </span>
          </div>
          <Variance declared={booking.quantityKg} actual={actual} />
          <FieldError errors={[errors.actualQtyKg]} />
        </Field>
        <Field data-invalid={!!errors.moisturePct || undefined}>
          <FieldLabel htmlFor="insp-moisture">
            Moisture <span className="font-normal text-muted-foreground">(optional)</span>
          </FieldLabel>
          <div className="relative">
            <Input
              id="insp-moisture"
              inputMode="decimal"
              placeholder="12.5"
              className={`${inputClass} pr-10`}
              aria-invalid={!!errors.moisturePct}
              {...register("moisturePct")}
            />
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden>
              %
            </span>
          </div>
          <FieldError errors={[errors.moisturePct]} />
        </Field>
      </div>

      <Field data-invalid={!!errors.notes || undefined}>
        <FieldLabel htmlFor="insp-notes">
          Notes {!rejecting && <span className="font-normal text-muted-foreground">(optional)</span>}
        </FieldLabel>
        <Textarea
          id="insp-notes"
          rows={3}
          placeholder={rejecting ? "Soft rot in about a fifth of the sacks" : "Clean, well-sorted lot"}
          aria-invalid={!!errors.notes}
          {...register("notes")}
        />
        <FieldError errors={[errors.notes]} />
      </Field>

      {rejecting && (
        <p className="flex items-start gap-2 rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          Rejecting cancels the booking straight away and frees the space. Refund the farmer from Payments afterwards.
        </p>
      )}

      <DialogFooter>
        <Button type="button" variant="ghost" className="rounded-full" onClick={onDone} disabled={record.isPending}>
          Cancel
        </Button>
        <Button type="submit" variant={rejecting ? "destructive" : "default"} className="rounded-full" disabled={record.isPending}>
          {record.isPending && <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />}
          {rejecting ? "Reject lot" : "Record inspection"}
        </Button>
      </DialogFooter>
    </form>
  )
}
