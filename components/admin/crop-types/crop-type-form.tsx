"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { inputClass } from "@/components/profile/account-form"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useCreateCropType, useUpdateCropType } from "@/hooks/use-crop-types"
import { ApiError } from "@/lib/api/client"
import type { CropTypePayload } from "@/lib/api/crop-types"
import { applyServerFieldErrors, getErrorMessage } from "@/lib/api/form-errors"
import { formatTempRange } from "@/lib/format"
import { cropTypeFormSchema, type CropTypeFormValues } from "@/schemas/crop-type"
import type { CropType } from "@/types/crop-type"

const FIELDS = ["name", "idealMinTempC", "idealMaxTempC", "maxStorageDays"] as const

function toValues(crop?: CropType): CropTypeFormValues {
  return {
    name: crop?.name ?? "",
    idealMinTempC: crop ? String(crop.idealMinTempC) : "",
    idealMaxTempC: crop ? String(crop.idealMaxTempC) : "",
    maxStorageDays: crop ? String(crop.maxStorageDays) : "",
  }
}

function toPayload(values: CropTypeFormValues): Required<CropTypePayload> {
  return {
    name: values.name,
    idealMinTempC: Number(values.idealMinTempC),
    idealMaxTempC: Number(values.idealMaxTempC),
    maxStorageDays: Number(values.maxStorageDays),
  }
}


export function CropTypeForm({ crop, onDone }: { crop?: CropType; onDone: () => void }) {
  const create = useCreateCropType()
  const update = useUpdateCropType()
  const pending = create.isPending || update.isPending
  const initial = toValues(crop)
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<CropTypeFormValues>({ resolver: zodResolver(cropTypeFormSchema), defaultValues: initial })
  const [minTemp, maxTemp, days] = useWatch({ control, name: ["idealMinTempC", "idealMaxTempC", "maxStorageDays"] })
  const preview = cropTypeFormSchema.safeParse({ name: "xx", idealMinTempC: minTemp, idealMaxTempC: maxTemp, maxStorageDays: days || "1" })

  const onError = (error: Error) => {
    if (error instanceof ApiError && error.fieldErrors.some((field) => field.path === "name")) {
      setError("name", { type: "server", message: "A crop type with this name already exists" }, { shouldFocus: true })
      return
    }
    if (applyServerFieldErrors(error, setError, FIELDS)) return
    toast.error(crop ? "Couldn't save the crop type" : "Couldn't add the crop type", { description: getErrorMessage(error) })
  }

  const onSubmit = handleSubmit((values) => {
    const payload = toPayload(values)
    if (!crop) {
      create.mutate(payload, { onSuccess: onDone, onError })
      return
    }
    const before = toPayload(initial)
    const changed = Object.fromEntries(
      Object.entries(payload).filter(([key, value]) => before[key as keyof typeof before] !== value)
    ) as CropTypePayload
    if (Object.keys(changed).length === 0) {
      onDone()
      return
    }
    update.mutate({ id: crop.id, payload: changed }, { onSuccess: onDone, onError })
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <FieldGroup className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.name || undefined} className="sm:col-span-2">
          <FieldLabel htmlFor="crop-name">Crop name</FieldLabel>
          <Input id="crop-name" placeholder="Potato" className={inputClass} aria-invalid={!!errors.name} {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field data-invalid={!!errors.idealMinTempC || undefined}>
          <FieldLabel htmlFor="crop-min">Ideal min temperature</FieldLabel>
          <div className="relative">
            <Input
              id="crop-min"
              inputMode="decimal"
              placeholder="2"
              className={`${inputClass} pr-10`}
              aria-invalid={!!errors.idealMinTempC}
              {...register("idealMinTempC")}
            />
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden>
              °C
            </span>
          </div>
          <FieldError errors={[errors.idealMinTempC]} />
        </Field>
        <Field data-invalid={!!errors.idealMaxTempC || undefined}>
          <FieldLabel htmlFor="crop-max">Ideal max temperature</FieldLabel>
          <div className="relative">
            <Input
              id="crop-max"
              inputMode="decimal"
              placeholder="4"
              className={`${inputClass} pr-10`}
              aria-invalid={!!errors.idealMaxTempC}
              {...register("idealMaxTempC")}
            />
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden>
              °C
            </span>
          </div>
          <FieldError errors={[errors.idealMaxTempC]} />
        </Field>
        <Field data-invalid={!!errors.maxStorageDays || undefined} className="sm:col-span-2">
          <FieldLabel htmlFor="crop-days">Longest safe storage</FieldLabel>
          <div className="relative sm:w-1/2">
            <Input
              id="crop-days"
              inputMode="numeric"
              placeholder="180"
              className={`${inputClass} pr-14`}
              aria-invalid={!!errors.maxStorageDays}
              {...register("maxStorageDays")}
            />
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden>
              days
            </span>
          </div>
          <FieldDescription>Farmers can&apos;t book this crop for longer than this.</FieldDescription>
          <FieldError errors={[errors.maxStorageDays]} />
        </Field>
      </FieldGroup>

      <p aria-live="polite" className="rounded-2xl bg-sky-500/10 p-4 text-sm text-sky-900 dark:text-sky-200">
        {preview.success
          ? `Needs a chamber whose range covers ${formatTempRange(Number(minTemp), Number(maxTemp))}${
              days ? `, for up to ${days} days` : ""
            }.`
          : "Enter the ideal temperature range to see which chambers can store it."}
      </p>

      <DialogFooter>
        <Button type="button" variant="ghost" className="rounded-full" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" className="rounded-full" disabled={pending || (!!crop && !isDirty)}>
          {pending && <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />}
          {crop ? "Save changes" : "Add crop type"}
        </Button>
      </DialogFooter>
    </form>
  )
}
