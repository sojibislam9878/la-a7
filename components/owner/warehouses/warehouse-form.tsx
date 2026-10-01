"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircleIcon, Loader2Icon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { inputClass } from "@/components/profile/account-form"
import { DistrictSelect } from "@/components/shared/district-select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useCreateWarehouse, useOwnerWarehouse, useUpdateWarehouse } from "@/hooks/use-owner-warehouses"
import { ApiError } from "@/lib/api/client"
import { applyServerFieldErrors, getErrorMessage } from "@/lib/api/form-errors"
import { warehouseFormSchema, type WarehouseFormValues } from "@/schemas/warehouse"
import type { Warehouse, WarehouseDetail, WarehousePayload } from "@/types/warehouse"

const FIELDS = ["name", "licenseNo", "district", "address", "ratePerKgPerDay", "minBookingDays"] as const

const EMPTY: WarehouseFormValues = {
  name: "",
  licenseNo: "",
  district: "",
  address: "",
  ratePerKgPerDay: "",
  minBookingDays: "7",
}

function toValues(warehouse: WarehouseDetail): WarehouseFormValues {
  return {
    name: warehouse.name,
    licenseNo: warehouse.licenseNo,
    district: warehouse.district,
    address: warehouse.address,
    ratePerKgPerDay: String(warehouse.ratePerKgPerDay),
    minBookingDays: String(warehouse.minBookingDays),
  }
}

function toPayload(values: WarehouseFormValues): Required<WarehousePayload> {
  return {
    name: values.name,
    licenseNo: values.licenseNo,
    district: values.district,
    address: values.address,
    ratePerKgPerDay: Number(values.ratePerKgPerDay),
    minBookingDays: Number(values.minBookingDays),
  }
}


export function CreateBody({ onDone }: { onDone: () => void }) {
  return <WarehouseForm initial={EMPTY} onDone={onDone} />
}

export function EditBody({ warehouse, onDone }: { warehouse: Warehouse; onDone: () => void }) {
  const detail = useOwnerWarehouse(warehouse.id)

  if (detail.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Couldn&apos;t load this warehouse</AlertTitle>
        <AlertDescription>{getErrorMessage(detail.error)}</AlertDescription>
      </Alert>
    )
  }
  if (!detail.data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2" aria-busy="true" aria-label="Loading warehouse">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    )
  }
  return <WarehouseForm key={detail.data.id} warehouseId={warehouse.id} initial={toValues(detail.data)} onDone={onDone} />
}

function WarehouseForm({
  warehouseId,
  initial,
  onDone,
}: {
  warehouseId?: string
  initial: WarehouseFormValues
  onDone: () => void
}) {
  const create = useCreateWarehouse()
  const update = useUpdateWarehouse()
  const editing = !!warehouseId
  const pending = create.isPending || update.isPending
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: initial,
  })

  const onError = (error: Error) => {
    if (error instanceof ApiError && error.fieldErrors.some((field) => field.path === "licenseNo")) {
      setError("licenseNo", { type: "server", message: "Another warehouse is already registered with this license" }, { shouldFocus: true })
      return
    }
    if (applyServerFieldErrors(error, setError, FIELDS)) return
    toast.error(editing ? "Couldn't save the warehouse" : "Couldn't add the warehouse", {
      description: getErrorMessage(error),
    })
  }

  const onSubmit = handleSubmit((values) => {
    const payload = toPayload(values)
    if (!editing) {
      create.mutate(payload, { onSuccess: onDone, onError })
      return
    }
    const before = toPayload(initial)
    const changed = Object.fromEntries(
      Object.entries(payload).filter(([key, value]) => before[key as keyof WarehousePayload] !== value)
    ) as WarehousePayload
    if (Object.keys(changed).length === 0) {
      onDone()
      return
    }
    update.mutate({ id: warehouseId, payload: changed }, { onSuccess: onDone, onError })
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <FieldGroup className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.name || undefined}>
          <FieldLabel htmlFor="wh-name">Warehouse name</FieldLabel>
          <Input
            id="wh-name"
            placeholder="Pirgacha Farmers Cold House"
            className={inputClass}
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={!!errors.licenseNo || undefined}>
          <FieldLabel htmlFor="wh-license">Cold storage license no.</FieldLabel>
          <Input
            id="wh-license"
            autoComplete="off"
            placeholder="CS-RNG-2026-014"
            className={inputClass}
            aria-invalid={!!errors.licenseNo}
            {...register("licenseNo")}
          />
          <FieldError errors={[errors.licenseNo]} />
        </Field>

        <Field data-invalid={!!errors.district || undefined}>
          <FieldLabel htmlFor="wh-district">District</FieldLabel>
          <Controller
            control={control}
            name="district"
            render={({ field }) => (
              <DistrictSelect
                id="wh-district"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={!!errors.district}
              />
            )}
          />
          <FieldError errors={[errors.district]} />
        </Field>

        <Field data-invalid={!!errors.ratePerKgPerDay || undefined}>
          <FieldLabel htmlFor="wh-rate">Base rate</FieldLabel>
          <div className="relative">
            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden>
              $
            </span>
            <Input
              id="wh-rate"
              inputMode="decimal"
              placeholder="0.055"
              className={`${inputClass} pr-20 pl-7`}
              aria-invalid={!!errors.ratePerKgPerDay}
              aria-describedby="wh-rate-hint"
              {...register("ratePerKgPerDay")}
            />
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden>
              /kg/day
            </span>
          </div>
          <FieldDescription id="wh-rate-hint">What farmers pay per kg per day, before any surcharge.</FieldDescription>
          <FieldError errors={[errors.ratePerKgPerDay]} />
        </Field>

        <Field data-invalid={!!errors.address || undefined} className="sm:col-span-2">
          <FieldLabel htmlFor="wh-address">Address</FieldLabel>
          <Textarea
            id="wh-address"
            rows={2}
            placeholder="Pirgachha Bazar Road, Rangpur"
            className="rounded-xl border-soil/15 bg-card"
            aria-invalid={!!errors.address}
            {...register("address")}
          />
          <FieldError errors={[errors.address]} />
        </Field>

        <Field data-invalid={!!errors.minBookingDays || undefined}>
          <FieldLabel htmlFor="wh-min-days">Minimum booking</FieldLabel>
          <div className="relative">
            <Input
              id="wh-min-days"
              inputMode="numeric"
              className={`${inputClass} pr-14`}
              aria-invalid={!!errors.minBookingDays}
              {...register("minBookingDays")}
            />
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden>
              days
            </span>
          </div>
          <FieldDescription>Shorter stays are still billed this many days.</FieldDescription>
          <FieldError errors={[errors.minBookingDays]} />
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button type="button" variant="ghost" className="rounded-full" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" className="rounded-full" disabled={pending || (editing && !isDirty)}>
          {pending && <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />}
          {editing ? "Save changes" : "Submit for review"}
        </Button>
      </DialogFooter>
    </form>
  )
}
