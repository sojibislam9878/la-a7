"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, parseISO, startOfToday } from "date-fns"
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CheckIcon,
  Loader2Icon,
  SnowflakeIcon,
  SproutIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { BookingRequested } from "@/components/booking/booking-requested"
import { DateRangeField } from "@/components/warehouse/detail/date-range-field"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useWarehouseAvailability } from "@/hooks/use-availability"
import { useCreateBooking } from "@/hooks/use-bookings"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { ApiError } from "@/lib/api/client"
import { applyServerFieldErrors, getErrorMessage } from "@/lib/api/form-errors"
import { inclusiveDays } from "@/lib/availability-query"
import { formatKg, formatMoney, formatNumber, formatTempRange } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  type BookingFormValues,
  createBookingSchema,
  cropFitsChamber,
  latestStartDate,
  MAX_ADVANCE_DAYS,
} from "@/schemas/booking"
import type { Booking } from "@/types/booking"
import type { CropType } from "@/types/crop-type"
import type { Chamber, WarehouseDetail } from "@/types/warehouse"

const SERVER_FIELDS = ["chamberId", "cropTypeId", "quantityKg", "startDate", "endDate"] as const
const inputClass = "h-11 rounded-xl border-soil/15 bg-cream/60 dark:bg-input/20"
const sectionClass = "flex flex-col gap-4 rounded-3xl border border-soil/10 bg-card p-5 sm:p-6"

function fieldForBusinessError(message: string): (typeof SERVER_FIELDS)[number] | null {
  if (/needs .* but chamber/i.test(message)) return "cropTypeId"
  if (/minimum booking|at most/i.test(message)) return "endDate"
  if (/past|days ahead/i.test(message)) return "startDate"
  return null
}

export function BookingForm({
  warehouse,
  chambers,
  cropTypes,
  defaults,
}: {
  warehouse: WarehouseDetail
  chambers: Chamber[]
  cropTypes: CropType[]
  defaults: Partial<BookingFormValues>
}) {
  const [today] = useState(() => format(startOfToday(), "yyyy-MM-dd"))
  const [created, setCreated] = useState<Booking | null>(null)
  const createBooking = useCreateBooking()

  const schema = useMemo(
    () => createBookingSchema({ today, minBookingDays: warehouse.minBookingDays, chambers, cropTypes }),
    [today, warehouse.minBookingDays, chambers, cropTypes]
  )

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      chamberId: defaults.chamberId ?? (chambers.length === 1 ? chambers[0].id : ""),
      cropTypeId: defaults.cropTypeId ?? "",
      quantityKg: defaults.quantityKg ?? "",
      startDate: defaults.startDate ?? "",
      endDate: defaults.endDate ?? "",
    },
  })

  const [chamberId, cropTypeId, quantityKg, startDate, endDate] = useWatch({
    control,
    name: ["chamberId", "cropTypeId", "quantityKg", "startDate", "endDate"],
  })

  const windowKey = useDebouncedValue(`${startDate}|${endDate}|${cropTypeId}`)
  const params = useMemo(() => {
    const [start, end, crop] = windowKey.split("|")
    if (!start || !end || end < start) return null
    return { startDate: start, endDate: end, ...(crop ? { cropTypeId: crop } : {}) }
  }, [windowKey])
  const availability = useWarehouseAvailability(warehouse.id, params)

  const chamber = chambers.find((c) => c.id === chamberId)
  const crop = cropTypes.find((c) => c.id === cropTypeId)
  const chamberFree = availability.data?.chambers.find((c) => c.id === chamberId)
  const qty = /^\d+$/.test(quantityKg) ? Number(quantityKg) : 0
  const days = startDate && endDate && endDate >= startDate ? inclusiveDays(startDate, endDate) : 0
  const estimate = qty && days ? qty * warehouse.ratePerKgPerDay * days : null
  const overCapacity = !!chamberFree && qty > chamberFree.availableKg

  const onSubmit = handleSubmit((values) => {
    if (chamberFree && Number(values.quantityKg) > chamberFree.availableKg) {
      setError("quantityKg", {
        type: "capacity",
        message: `Only ${formatKg(chamberFree.availableKg)} is free in chamber ${chamber?.name} for these dates`,
      })
      return
    }

    createBooking.mutate(
      {
        chamberId: values.chamberId,
        cropTypeId: values.cropTypeId,
        quantityKg: Number(values.quantityKg),
        startDate: values.startDate,
        endDate: values.endDate,
      },
      {
        onSuccess: (booking) => {
          toast.success("Booking request sent", { description: `Lot ${booking.lotCode} is waiting for the owner's approval.` })
          setCreated(booking)
        },
        onError: (error) => {
          if (applyServerFieldErrors(error, setError, SERVER_FIELDS)) return
          if (error instanceof ApiError) {
            if (error.status === 409 && /available/i.test(error.message)) {
              setError("quantityKg", { type: "server", message: error.message }, { shouldFocus: true })
              void availability.refetch()
              return
            }
            const field = error.status === 422 ? fieldForBusinessError(error.message) : null
            if (field) {
              setError(field, { type: "server", message: error.message }, { shouldFocus: true })
              return
            }
          }
          setError("root", { type: "server", message: getErrorMessage(error) })
        },
      }
    )
  })

  if (created) return <BookingRequested booking={created} />

  const pending = createBooking.isPending

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex min-w-0 flex-col gap-6">
        {errors.root && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>We couldn&apos;t place this booking</AlertTitle>
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        )}

        <section className={sectionClass}>
          <FieldSet>
            <FieldLegend className="font-display text-xl font-semibold">1. Choose a chamber</FieldLegend>
            <Controller
              control={control}
              name="chamberId"
              render={({ field }) => (
                <RadioGroupPrimitive.Root
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-invalid={!!errors.chamberId}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {chambers.map((option) => {
                    const free = availability.data?.chambers.find((c) => c.id === option.id)
                    const fits = crop ? cropFitsChamber(crop, option) : true
                    return (
                      <RadioGroupPrimitive.Item
                        key={option.id}
                        value={option.id}
                        className={cn(
                          "group flex flex-col gap-2 rounded-2xl border-2 border-soil/10 bg-cream/40 p-4 text-left transition-colors outline-none",
                          "hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50",
                          "data-[state=checked]:border-primary data-[state=checked]:bg-primary/5"
                        )}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2 font-semibold">
                            <SnowflakeIcon className="size-4 text-sky-600 dark:text-sky-300" aria-hidden />
                            Chamber {option.name}
                          </span>
                          <span className="flex size-5 items-center justify-center rounded-full border-2 border-soil/20 group-data-[state=checked]:border-primary group-data-[state=checked]:bg-primary">
                            <CheckIcon className="size-3 text-primary-foreground opacity-0 group-data-[state=checked]:opacity-100" aria-hidden />
                          </span>
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatTempRange(option.minTempC, option.maxTempC)} · {formatKg(option.capacityKg)} capacity
                        </span>
                        {free && (
                          <span className="text-xs font-medium text-primary">{formatKg(free.availableKg)} free for your dates</span>
                        )}
                        {!fits && crop && (
                          <span className="flex items-center gap-1.5 text-xs text-destructive">
                            <TriangleAlertIcon className="size-3.5" aria-hidden />
                            Not suitable for {crop.name}
                          </span>
                        )}
                      </RadioGroupPrimitive.Item>
                    )
                  })}
                </RadioGroupPrimitive.Root>
              )}
            />
            <FieldError errors={[errors.chamberId]} />
          </FieldSet>
        </section>

        <section className={sectionClass}>
          <h2 className="font-display text-xl font-semibold">2. What are you storing?</h2>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.cropTypeId || undefined}>
              <FieldLabel htmlFor="booking-crop">Crop</FieldLabel>
              <Controller
                control={control}
                name="cropTypeId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="booking-crop"
                      aria-invalid={!!errors.cropTypeId}
                      className={cn(inputClass, "h-11! w-full text-left *:data-[slot=select-value]:grow")}
                      onBlur={field.onBlur}
                    >
                      <SproutIcon aria-hidden />
                      <SelectValue placeholder="Choose a crop" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-72">
                      {cropTypes.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name} · {formatTempRange(option.idealMinTempC, option.idealMaxTempC)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {crop && !errors.cropTypeId && (
                <FieldDescription>
                  Keeps best at {formatTempRange(crop.idealMinTempC, crop.idealMaxTempC)}, for up to {crop.maxStorageDays} days.
                </FieldDescription>
              )}
              <FieldError errors={[errors.cropTypeId]} />
            </Field>

            <Field data-invalid={!!errors.quantityKg || undefined}>
              <FieldLabel htmlFor="booking-qty">Quantity (kg)</FieldLabel>
              <Input
                id="booking-qty"
                inputMode="numeric"
                placeholder="2500"
                className={inputClass}
                aria-invalid={!!errors.quantityKg || overCapacity}
                {...register("quantityKg")}
              />
              {overCapacity && !errors.quantityKg && (
                <p className="flex items-center gap-1.5 text-sm text-destructive">
                  <TriangleAlertIcon className="size-4" aria-hidden />
                  Only {formatKg(chamberFree.availableKg)} is free in chamber {chamber?.name} for these dates
                </p>
              )}
              <FieldError errors={[errors.quantityKg]} />
            </Field>
          </FieldGroup>
        </section>

        <section className={sectionClass}>
          <Field data-invalid={!!(errors.startDate || errors.endDate) || undefined}>
            <FieldLabel htmlFor="booking-dates" className="font-display text-xl font-semibold">
              3. When do you need it?
            </FieldLabel>
            <FieldDescription>
              At least {warehouse.minBookingDays} days, starting within the next {MAX_ADVANCE_DAYS} days (by{" "}
              {format(parseISO(latestStartDate(today)), "MMM d")}).
            </FieldDescription>
            <Controller
              control={control}
              name="startDate"
              render={({ field: start }) => (
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field: end }) => (
                    <DateRangeField
                      id="booking-dates"
                      startDate={start.value}
                      endDate={end.value}
                      invalid={!!(errors.startDate || errors.endDate)}
                      onChange={(range) => {
                        start.onChange(range.startDate)
                        end.onChange(range.endDate)
                      }}
                    />
                  )}
                />
              )}
            />
            <FieldError errors={[errors.startDate ?? errors.endDate]} />
          </Field>
        </section>
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="flex flex-col gap-4 rounded-3xl bg-forest p-5 text-forest-foreground shadow-xl shadow-forest/20 sm:p-6">
          <div>
            <p className="text-xs tracking-wide text-forest-foreground/70 uppercase">Booking summary</p>
            <Link href={`/warehouses/${warehouse.id}`} className="font-display text-xl font-semibold hover:underline">
              {warehouse.name}
            </Link>
            <p className="text-sm text-forest-foreground/70">{warehouse.district}</p>
          </div>

          <dl className="flex flex-col gap-2 border-y border-forest-foreground/15 py-4 text-sm">
            <SummaryRow label="Chamber" value={chamber ? `${chamber.name} · ${formatTempRange(chamber.minTempC, chamber.maxTempC)}` : "Not chosen"} />
            <SummaryRow label="Crop" value={crop?.name ?? "Not chosen"} />
            <SummaryRow label="Quantity" value={qty ? `${formatNumber(qty)} kg` : "Not set"} />
            <SummaryRow
              label="Dates"
              value={
                days
                  ? `${format(parseISO(startDate), "MMM d")} to ${format(parseISO(endDate), "MMM d")} · ${days} days`
                  : "Not set"
              }
            />
            <SummaryRow label="Rate" value={`${formatMoney(warehouse.ratePerKgPerDay, { maximumFractionDigits: 3 })} /kg/day`} />
          </dl>

          <div aria-live="polite" className="text-sm">
            {!params ? null : availability.isFetching && !chamberFree ? (
              <Skeleton className="h-5 w-40 bg-forest-foreground/15" />
            ) : chamberFree ? (
              <p className={overCapacity ? "text-harvest" : "text-forest-foreground/80"}>
                {formatKg(chamberFree.availableKg)} free in chamber {chamberFree.name}
              </p>
            ) : availability.isError ? (
              <p className="text-forest-foreground/80">
                Couldn&apos;t check free space right now. You can still send the request; the owner confirms it.
              </p>
            ) : null}
          </div>

          <div className="flex items-end justify-between gap-3">
            <span className="text-sm text-forest-foreground/70">Estimated cost</span>
            <span className="text-3xl font-bold">{estimate === null ? "—" : formatMoney(estimate)}</span>
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-12 rounded-full bg-harvest text-base text-harvest-foreground hover:bg-harvest/90"
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />
                Sending request...
              </>
            ) : (
              <>
                Request booking
                <ArrowRightIcon data-icon="inline-end" aria-hidden />
              </>
            )}
          </Button>

          <ol className="flex flex-col gap-1.5 text-xs text-forest-foreground/75">
            <li>1. The warehouse owner reviews your request.</li>
            <li>2. Once approved, you pay online to confirm.</li>
            <li>3. Bring your produce in; it&apos;s graded at intake.</li>
          </ol>
        </div>
      </aside>
    </form>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-forest-foreground/70">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}
