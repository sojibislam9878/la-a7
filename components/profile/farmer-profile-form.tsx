"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircleIcon, Loader2Icon, RotateCwIcon, SproutIcon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { inputClass } from "@/components/profile/account-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { DISTRICTS } from "@/constants/districts"
import { useFarmerProfile, useSaveFarmerProfile } from "@/hooks/use-profile"
import { applyServerFieldErrors, getErrorMessage } from "@/lib/api/form-errors"
import { createFarmerProfileSchema, type FarmerProfileValues } from "@/schemas/profile"
import type { FarmerProfile, FarmerProfilePayload } from "@/types/farmer"

const FIELDS = ["district", "upazila", "nid", "farmSizeAcre"] as const

function toValues(profile: FarmerProfile | null): FarmerProfileValues {
  return {
    district: profile?.district ?? "",
    upazila: profile?.upazila ?? "",
    nid: profile?.nid ?? "",
    farmSizeAcre: profile?.farmSizeAcre == null ? "" : String(profile.farmSizeAcre),
  }
}

function toPayload(values: FarmerProfileValues, previous: FarmerProfileValues): FarmerProfilePayload {
  const payload: FarmerProfilePayload = {}
  if (values.district !== previous.district) payload.district = values.district
  if (values.upazila && values.upazila !== previous.upazila) payload.upazila = values.upazila
  if (values.nid && values.nid !== previous.nid) payload.nid = values.nid
  if (values.farmSizeAcre && values.farmSizeAcre !== previous.farmSizeAcre) payload.farmSizeAcre = Number(values.farmSizeAcre)
  return payload
}

export function FarmerProfileSection() {
  const profile = useFarmerProfile()

  if (profile.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Couldn&apos;t load your farming profile</AlertTitle>
        <AlertDescription>
          <p>{getErrorMessage(profile.error)}</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={() => profile.refetch()}>
            <RotateCwIcon data-icon="inline-start" aria-hidden />
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (profile.data === undefined) {
    return (
      <div className="grid gap-4 sm:grid-cols-2" aria-busy="true" aria-label="Loading farming profile">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    )
  }

  return <FarmerProfileForm key={profile.data?.updatedAt ?? "new"} profile={profile.data} />
}

function FarmerProfileForm({ profile }: { profile: FarmerProfile | null }) {
  const save = useSaveFarmerProfile()
  const creating = profile === null
  const initial = toValues(profile)
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<FarmerProfileValues>({
    resolver: zodResolver(
      createFarmerProfileSchema({
        upazila: !!profile?.upazila,
        nid: !!profile?.nid,
        farmSizeAcre: profile?.farmSizeAcre != null,
      })
    ),
    defaultValues: initial,
  })

  const onSubmit = handleSubmit((values) => {
    const payload = toPayload(values, initial)
    if (!creating && Object.keys(payload).length === 0) {
      reset(values)
      return
    }
    save.mutate(
      { payload, create: creating },
      {
        onError: (error) => {
          if (applyServerFieldErrors(error, setError, FIELDS)) return
          toast.error("Couldn't save your farming profile", { description: getErrorMessage(error) })
        },
      }
    )
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {creating && (
        <p className="flex items-start gap-3 rounded-2xl bg-harvest/15 p-4 text-sm text-harvest-foreground dark:text-harvest">
          <SproutIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          Tell warehouse owners where you farm. Only your district is required.
        </p>
      )}

      <FieldGroup className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.district || undefined}>
          <FieldLabel htmlFor="farmer-district">District</FieldLabel>
          <Controller
            control={control}
            name="district"
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange} name={field.name}>
                <SelectTrigger
                  id="farmer-district"
                  aria-invalid={!!errors.district}
                  onBlur={field.onBlur}
                  className="h-10! w-full rounded-xl border-soil/15 bg-card text-left *:data-[slot=select-value]:grow"
                >
                  <SelectValue placeholder="Choose a district" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-72">
                  {DISTRICTS.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.district]} />
        </Field>

        <Field data-invalid={!!errors.upazila || undefined}>
          <FieldLabel htmlFor="farmer-upazila">
            Upazila {!profile?.upazila && <span className="font-normal text-muted-foreground">(optional)</span>}
          </FieldLabel>
          <Input
            id="farmer-upazila"
            placeholder="Pirgachha"
            className={inputClass}
            aria-invalid={!!errors.upazila}
            {...register("upazila")}
          />
          <FieldError errors={[errors.upazila]} />
        </Field>

        <Field data-invalid={!!errors.farmSizeAcre || undefined}>
          <FieldLabel htmlFor="farmer-size">
            Farm size {!profile?.farmSizeAcre && <span className="font-normal text-muted-foreground">(optional)</span>}
          </FieldLabel>
          <div className="relative">
            <Input
              id="farmer-size"
              inputMode="decimal"
              placeholder="2.5"
              className={`${inputClass} pr-14`}
              aria-invalid={!!errors.farmSizeAcre}
              {...register("farmSizeAcre")}
            />
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden>
              acres
            </span>
          </div>
          <FieldError errors={[errors.farmSizeAcre]} />
        </Field>

        <Field data-invalid={!!errors.nid || undefined}>
          <FieldLabel htmlFor="farmer-nid">
            National ID {!profile?.nid && <span className="font-normal text-muted-foreground">(optional)</span>}
          </FieldLabel>
          <Input
            id="farmer-nid"
            inputMode="numeric"
            autoComplete="off"
            placeholder="10, 13 or 17 digits"
            className={inputClass}
            aria-invalid={!!errors.nid}
            {...register("nid")}
          />
          <FieldDescription>Only visible to you and platform admins.</FieldDescription>
          <FieldError errors={[errors.nid]} />
        </Field>
      </FieldGroup>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" className="rounded-full" disabled={(!creating && !isDirty) || save.isPending}>
          {save.isPending && <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />}
          {creating ? "Create farming profile" : "Save changes"}
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
