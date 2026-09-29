"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { inputClass } from "@/components/profile/account-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useCreateChamber, useUpdateChamber } from "@/hooks/use-chambers"
import { applyServerFieldErrors, getErrorMessage } from "@/lib/api/form-errors"
import { cn } from "@/lib/utils"
import { type ChamberFormValues, chamberFormSchema } from "@/schemas/chamber"
import { cropFitsChamber } from "@/schemas/booking"
import type { CropType } from "@/types/crop-type"
import type { Chamber, ChamberPayload } from "@/types/warehouse"

const FIELDS = ["name", "capacityKg", "minTempC", "maxTempC"] as const

function toValues(chamber?: Chamber): ChamberFormValues {
  return {
    name: chamber?.name ?? "",
    capacityKg: chamber ? String(chamber.capacityKg) : "",
    minTempC: chamber ? String(chamber.minTempC) : "",
    maxTempC: chamber ? String(chamber.maxTempC) : "",
  }
}

function toPayload(values: ChamberFormValues): Required<Omit<ChamberPayload, "isActive">> {
  return {
    name: values.name,
    capacityKg: Number(values.capacityKg),
    minTempC: Number(values.minTempC),
    maxTempC: Number(values.maxTempC),
  }
}

export function ChamberFormDialog({
  warehouseId,
  chamber,
  cropTypes,
  open,
  onOpenChange,
}: {
  warehouseId: string
  chamber?: Chamber
  cropTypes: CropType[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{chamber ? `Edit chamber ${chamber.name}` : "Add a chamber"}</DialogTitle>
          <DialogDescription>
            The temperature range decides which crops farmers can store here.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <ChamberForm
            key={chamber?.id ?? "new"}
            warehouseId={warehouseId}
            chamber={chamber}
            cropTypes={cropTypes}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function ChamberForm({
  warehouseId,
  chamber,
  cropTypes,
  onDone,
}: {
  warehouseId: string
  chamber?: Chamber
  cropTypes: CropType[]
  onDone: () => void
}) {
  const create = useCreateChamber(warehouseId)
  const update = useUpdateChamber(warehouseId)
  const pending = create.isPending || update.isPending
  const initial = toValues(chamber)
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<ChamberFormValues>({
    resolver: zodResolver(chamberFormSchema),
    defaultValues: initial,
  })
  const [minTemp, maxTemp] = useWatch({ control, name: ["minTempC", "maxTempC"] })
  const range = chamberFormSchema.safeParse({ name: "x", capacityKg: "1", minTempC: minTemp, maxTempC: maxTemp })
  const fitting = range.success
    ? cropTypes.filter((crop) => cropFitsChamber(crop, { minTempC: Number(minTemp), maxTempC: Number(maxTemp) }))
    : null

  const onError = (error: Error) => {
    if (applyServerFieldErrors(error, setError, FIELDS)) return
    toast.error("Couldn't add the chamber", { description: getErrorMessage(error) })
  }

  const onSubmit = handleSubmit((values) => {
    const payload = toPayload(values)
    if (!chamber) {
      create.mutate(payload, { onSuccess: onDone, onError })
      return
    }
    const before = toPayload(initial)
    const changed = Object.fromEntries(
      Object.entries(payload).filter(([key, value]) => before[key as keyof typeof before] !== value)
    ) as ChamberPayload
    if (Object.keys(changed).length === 0) {
      onDone()
      return
    }
    update.mutate({ id: chamber.id, payload: changed }, { onSuccess: onDone })
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <FieldGroup className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.name || undefined}>
          <FieldLabel htmlFor="ch-name">Chamber name</FieldLabel>
          <Input id="ch-name" placeholder="A-1" className={inputClass} aria-invalid={!!errors.name} {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={!!errors.capacityKg || undefined}>
          <FieldLabel htmlFor="ch-capacity">Capacity</FieldLabel>
          <div className="relative">
            <Input
              id="ch-capacity"
              inputMode="numeric"
              placeholder="10000"
              className={`${inputClass} pr-10`}
              aria-invalid={!!errors.capacityKg}
              {...register("capacityKg")}
            />
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden>
              kg
            </span>
          </div>
          <FieldError errors={[errors.capacityKg]} />
        </Field>

        <Field data-invalid={!!errors.minTempC || undefined}>
          <FieldLabel htmlFor="ch-min">Min temperature</FieldLabel>
          <div className="relative">
            <Input
              id="ch-min"
              inputMode="decimal"
              placeholder="0"
              className={`${inputClass} pr-10`}
              aria-invalid={!!errors.minTempC}
              {...register("minTempC")}
            />
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden>
              °C
            </span>
          </div>
          <FieldError errors={[errors.minTempC]} />
        </Field>

        <Field data-invalid={!!errors.maxTempC || undefined}>
          <FieldLabel htmlFor="ch-max">Max temperature</FieldLabel>
          <div className="relative">
            <Input
              id="ch-max"
              inputMode="decimal"
              placeholder="4"
              className={`${inputClass} pr-10`}
              aria-invalid={!!errors.maxTempC}
              {...register("maxTempC")}
            />
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden>
              °C
            </span>
          </div>
          <FieldError errors={[errors.maxTempC]} />
        </Field>
      </FieldGroup>

      <div
        aria-live="polite"
        className={cn(
          "rounded-2xl p-4 text-sm",
          fitting && fitting.length === 0 ? "bg-harvest/15 text-harvest-foreground dark:text-harvest" : "bg-cream/70 dark:bg-muted/40"
        )}
      >
        {fitting === null ? (
          <FieldDescription>Enter a temperature range to see which crops fit.</FieldDescription>
        ) : fitting.length === 0 ? (
          <p>No crop&apos;s ideal range fits inside this chamber. Farmers won&apos;t be able to book it.</p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="font-medium">
              Fits {fitting.length} of {cropTypes.length} crops
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {fitting.map((crop) => (
                <li key={crop.id} className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {crop.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="ghost" className="rounded-full" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" className="rounded-full" disabled={pending || (!!chamber && !isDirty)}>
          {pending && <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />}
          {chamber ? "Save changes" : "Add chamber"}
        </Button>
      </DialogFooter>
    </form>
  )
}

