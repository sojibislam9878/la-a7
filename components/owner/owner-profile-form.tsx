"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { inputClass } from "@/components/profile/account-form"
import { DistrictSelect } from "@/components/shared/district-select"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSaveOwnerProfile } from "@/hooks/use-profile"
import { applyServerFieldErrors, getErrorMessage } from "@/lib/api/form-errors"
import { type OwnerProfileValues, ownerProfileSchema } from "@/schemas/profile"
import type { OwnerProfile, OwnerProfilePayload } from "@/types/owner"

const FIELDS = ["businessName", "tradeLicenseNo", "nid", "district", "address"] as const

function toValues(profile: OwnerProfile | null): OwnerProfileValues {
  return {
    businessName: profile?.businessName ?? "",
    tradeLicenseNo: profile?.tradeLicenseNo ?? "",
    nid: profile?.nid ?? "",
    district: profile?.district ?? "",
    address: profile?.address ?? "",
  }
}

export function OwnerProfileForm({
  profile,
  submitLabel,
  onSaved,
}: {
  profile: OwnerProfile | null
  submitLabel: string
  onSaved?: (profile: OwnerProfile) => void
}) {
  const save = useSaveOwnerProfile()
  const creating = profile === null
  const initial = toValues(profile)
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<OwnerProfileValues>({
    resolver: zodResolver(ownerProfileSchema),
    defaultValues: initial,
  })

  const onSubmit = handleSubmit((values) => {
    const payload: OwnerProfilePayload = creating
      ? values
      : Object.fromEntries(FIELDS.filter((field) => values[field] !== initial[field]).map((field) => [field, values[field]]))
    if (!creating && Object.keys(payload).length === 0) {
      reset(values)
      return
    }
    save.mutate(
      { payload, create: creating },
      {
        onSuccess: (saved) => onSaved?.(saved),
        onError: (error) => {
          if (applyServerFieldErrors(error, setError, FIELDS)) return
          toast.error("Couldn't save your business profile", { description: getErrorMessage(error) })
        },
      }
    )
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <FieldGroup className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.businessName || undefined} className="sm:col-span-2">
          <FieldLabel htmlFor="owner-business">Business name</FieldLabel>
          <Input
            id="owner-business"
            autoComplete="organization"
            placeholder="Rangpur Cold Storage Ltd."
            className={inputClass}
            aria-invalid={!!errors.businessName}
            {...register("businessName")}
          />
          <FieldDescription>Shown to farmers on each of your warehouse listings.</FieldDescription>
          <FieldError errors={[errors.businessName]} />
        </Field>

        <Field data-invalid={!!errors.tradeLicenseNo || undefined}>
          <FieldLabel htmlFor="owner-license">Trade license number</FieldLabel>
          <Input
            id="owner-license"
            autoComplete="off"
            placeholder="TRAD/DNCC/012345/2026"
            className={inputClass}
            aria-invalid={!!errors.tradeLicenseNo}
            {...register("tradeLicenseNo")}
          />
          <FieldError errors={[errors.tradeLicenseNo]} />
        </Field>

        <Field data-invalid={!!errors.nid || undefined}>
          <FieldLabel htmlFor="owner-nid">National ID</FieldLabel>
          <Input
            id="owner-nid"
            inputMode="numeric"
            autoComplete="off"
            placeholder="10, 13 or 17 digits"
            className={inputClass}
            aria-invalid={!!errors.nid}
            {...register("nid")}
          />
          <FieldError errors={[errors.nid]} />
        </Field>

        <Field data-invalid={!!errors.district || undefined}>
          <FieldLabel htmlFor="owner-district">District</FieldLabel>
          <Controller
            control={control}
            name="district"
            render={({ field }) => (
              <DistrictSelect
                id="owner-district"
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

        <Field data-invalid={!!errors.address || undefined} className="sm:col-span-2">
          <FieldLabel htmlFor="owner-address">Business address</FieldLabel>
          <Textarea
            id="owner-address"
            rows={3}
            autoComplete="street-address"
            placeholder="Holding 12, Station Road, Rangpur Sadar"
            className="rounded-xl border-soil/15 bg-card"
            aria-invalid={!!errors.address}
            {...register("address")}
          />
          <FieldError errors={[errors.address]} />
        </Field>
      </FieldGroup>

      <p className="text-xs text-muted-foreground">
        Your trade license and NID are only visible to you and platform admins, who check them when approving your
        warehouses.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" className="rounded-full" disabled={(!creating && !isDirty) || save.isPending}>
          {save.isPending && <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />}
          {submitLabel}
        </Button>
        {!creating && isDirty && !save.isPending && (
          <Button type="button" variant="ghost" className="rounded-full" onClick={() => reset()}>
            Discard
          </Button>
        )}
      </div>
    </form>
  )
}
