"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, parseISO } from "date-fns"
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CheckIcon,
  Loader2Icon,
  LogInIcon,
  PackageIcon,
  SearchIcon,
  SnowflakeIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { Controller, useForm } from "react-hook-form"

import { DateRangeField } from "@/components/warehouse/detail/date-range-field"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAvailabilitySelection, useWarehouseAvailability } from "@/hooks/use-availability"
import { getErrorMessage } from "@/lib/api/form-errors"
import { isChamberBookable, pickChamber } from "@/lib/availability-pick"
import { billableDays, bookingHref, estimateCost } from "@/lib/availability-query"
import { formatKg, formatMoney, formatNumber, formatTempRange } from "@/lib/format"
import { cn } from "@/lib/utils"
import { availabilityFormSchema, type AvailabilityFormValues } from "@/schemas/availability"
import { useAuthStore } from "@/stores/auth-store"
import type { CropType } from "@/types/crop-type"
import type { ChamberAvailabilitySummary, WarehouseDetail } from "@/types/warehouse"

const ANY = "any"
const inputClass = "h-11 rounded-xl border-soil/15 bg-cream/60 dark:bg-input/20"

export function AvailabilityPanel({ warehouse, cropTypes }: { warehouse: WarehouseDetail; cropTypes: CropType[] }) {
  const { selection, params, update } = useAvailabilitySelection()
  const availability = useWarehouseAvailability(warehouse.id, params)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilityFormSchema),
    defaultValues: {
      startDate: selection.from ?? "",
      endDate: selection.to ?? "",
      cropTypeId: selection.crop ?? "",
      quantityKg: selection.qty ? String(selection.qty) : "",
    },
  })

  const onSubmit = handleSubmit((values) =>
    update({
      from: values.startDate,
      to: values.endDate,
      crop: values.cropTypeId || undefined,
      qty: values.quantityKg ? Number(values.quantityKg) : undefined,
      chamber: undefined,
    })
  )

  const result = availability.data
  const selected = pickChamber(result, selection)

  return (
    <section
      aria-labelledby="availability-heading"
      className="flex flex-col gap-5 rounded-3xl border border-soil/10 bg-card p-5 shadow-[0_24px_60px_-28px] shadow-soil/25 sm:p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 id="availability-heading" className="font-display text-2xl font-semibold">
          Check availability
        </h2>
        <p className="text-sm text-muted-foreground">See how many kilograms are free for your exact dates.</p>
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FieldGroup className="gap-4">
          <Field data-invalid={!!(errors.startDate || errors.endDate) || undefined}>
            <FieldLabel htmlFor="availability-dates">Storage dates</FieldLabel>
            <Controller
              control={control}
              name="startDate"
              render={({ field: start }) => (
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field: end }) => (
                    <DateRangeField
                      id="availability-dates"
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

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="availability-crop">Crop</FieldLabel>
              <Controller
                control={control}
                name="cropTypeId"
                render={({ field }) => (
                  <Select value={field.value || ANY} onValueChange={(v) => field.onChange(v === ANY ? "" : v)}>
                    <SelectTrigger id="availability-crop" className={cn(inputClass, "h-11! w-full")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-72">
                      <SelectItem value={ANY}>Any crop</SelectItem>
                      {cropTypes.map((crop) => (
                        <SelectItem key={crop.id} value={crop.id}>
                          {crop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field data-invalid={!!errors.quantityKg || undefined}>
              <FieldLabel htmlFor="availability-qty">Quantity (kg)</FieldLabel>
              <Input
                id="availability-qty"
                inputMode="numeric"
                placeholder="2500"
                className={inputClass}
                aria-invalid={!!errors.quantityKg}
                {...register("quantityKg")}
              />
            </Field>
          </div>
          <FieldError errors={[errors.quantityKg]} className="-mt-2" />
        </FieldGroup>

        <Button type="submit" size="lg" className="h-11 rounded-full" disabled={availability.isFetching}>
          {availability.isFetching ? (
            <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />
          ) : (
            <SearchIcon data-icon="inline-start" aria-hidden />
          )}
          Check availability
        </Button>
      </form>

      <div aria-live="polite" className="flex flex-col gap-4">
        {params && availability.isPending && <ResultsSkeleton />}

        {availability.isError && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Couldn&apos;t check availability</AlertTitle>
            <AlertDescription>{getErrorMessage(availability.error)}</AlertDescription>
          </Alert>
        )}

        {result && !availability.isError && (
          <>
            <div className="flex items-center justify-between gap-3 border-t border-soil/10 pt-4">
              <p className="text-sm">
                <span className="font-semibold">
                  {format(parseISO(result.window.startDate), "MMM d")} to{" "}
                  {format(parseISO(result.window.endDate), "MMM d, yyyy")}
                </span>{" "}
                <span className="text-muted-foreground">· {result.window.days} days</span>
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{formatKg(result.totalAvailableKg)}</span> free
              </p>
            </div>

            {!result.meetsMinBookingDays && (
              <Notice>
                Bookings here need at least {warehouse.minBookingDays} days. Extend your dates to book.
              </Notice>
            )}
            {result.cropType && result.withinCropMaxStorageDays === false && (
              <Notice>
                {result.cropType.name} can be stored for at most {result.cropType.maxStorageDays} days.
              </Notice>
            )}

            {result.chambers.length === 0 ? (
              <p className="text-sm text-muted-foreground">This warehouse has no active chambers.</p>
            ) : (
              <RadioGroupPrimitive.Root
                value={selected?.id ?? ""}
                onValueChange={(id) => update({ chamber: id })}
                aria-label="Choose a chamber"
                className="flex flex-col gap-2"
              >
                {result.chambers.map((chamber) => (
                  <ChamberOption
                    key={chamber.id}
                    chamber={chamber}
                    quantityKg={selection.qty}
                    cropName={result.cropType?.name}
                  />
                ))}
              </RadioGroupPrimitive.Root>
            )}

            <BookingSummary
              warehouse={warehouse}
              chamber={selected}
              days={result.window.days}
              canBook={
                warehouse.status === "APPROVED" &&
                result.meetsMinBookingDays &&
                result.withinCropMaxStorageDays !== false &&
                !!selected &&
                isChamberBookable(selected, selection.qty)
              }
              from={result.window.startDate}
              to={result.window.endDate}
              cropTypeId={selection.crop}
              quantityKg={selection.qty}
            />
          </>
        )}
      </div>
    </section>
  )
}

function ChamberOption({
  chamber,
  quantityKg,
  cropName,
}: {
  chamber: ChamberAvailabilitySummary
  quantityKg?: number
  cropName?: string
}) {
  const bookable = isChamberBookable(chamber, quantityKg)
  const usedPct = chamber.capacityKg > 0 ? Math.round((chamber.peakUsedKg / chamber.capacityKg) * 100) : 100

  let reason: string | null = null
  if (chamber.fitsCrop === false) reason = `Temperature doesn't suit ${cropName ?? "this crop"}`
  else if (chamber.availableKg === 0) reason = "Fully booked for these dates"
  else if (quantityKg && chamber.availableKg < quantityKg) reason = `Only ${formatKg(chamber.availableKg)} free`

  return (
    <RadioGroupPrimitive.Item
      value={chamber.id}
      disabled={!bookable}
      className={cn(
        "group flex flex-col gap-2.5 rounded-2xl border-2 border-soil/10 bg-cream/40 p-3.5 text-left transition-colors outline-none",
        "hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary/5",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-soil/10"
      )}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <SnowflakeIcon className="size-4 text-sky-600 dark:text-sky-300" aria-hidden />
          <span className="font-semibold">Chamber {chamber.name}</span>
          <span className="text-xs text-muted-foreground">{formatTempRange(chamber.minTempC, chamber.maxTempC)}</span>
        </span>
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-soil/20 group-data-[state=checked]:border-primary group-data-[state=checked]:bg-primary">
          <CheckIcon className="size-3 text-primary-foreground opacity-0 group-data-[state=checked]:opacity-100" aria-hidden />
        </span>
      </span>

      <span className="flex flex-col gap-1">
        <span className="flex justify-between text-xs">
          <span className={cn("font-medium", bookable ? "text-foreground" : "text-muted-foreground")}>
            {formatKg(chamber.availableKg)} free
          </span>
          <span className="text-muted-foreground">of {formatKg(chamber.capacityKg)}</span>
        </span>
        <span className="h-1.5 overflow-hidden rounded-full bg-primary/15" aria-hidden>
          <span className="block h-full rounded-full bg-primary" style={{ width: `${100 - usedPct}%` }} />
        </span>
      </span>

      {reason && (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <TriangleAlertIcon className="size-3.5" aria-hidden />
          {reason}
        </span>
      )}
    </RadioGroupPrimitive.Item>
  )
}

function BookingSummary({
  warehouse,
  chamber,
  days,
  canBook,
  from,
  to,
  cropTypeId,
  quantityKg,
}: {
  warehouse: WarehouseDetail
  chamber: ChamberAvailabilitySummary | undefined
  days: number
  canBook: boolean
  from: string
  to: string
  cropTypeId?: string
  quantityKg?: number
}) {
  const status = useAuthStore((state) => state.status)
  const role = useAuthStore((state) => state.user?.role)
  const billable = billableDays(days, warehouse.minBookingDays)
  const href =
    chamber && bookingHref({ warehouseId: warehouse.id, chamberId: chamber.id, from, to, cropTypeId, quantityKg })

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-forest p-4 text-forest-foreground">
      {quantityKg ? (
        <div className="flex items-end justify-between gap-3">
          <div className="text-sm text-forest-foreground/80">
            <p>
              {formatNumber(quantityKg)} kg × {formatMoney(warehouse.ratePerKgPerDay, { maximumFractionDigits: 3 })} ×{" "}
              {billable} days
            </p>
            {billable > days && <p className="text-xs">Minimum {warehouse.minBookingDays} days applies</p>}
          </div>
          <p className="text-right">
            <span className="block text-xs text-forest-foreground/70">Estimated cost</span>
            <span className="text-2xl font-bold">
              {formatMoney(estimateCost(quantityKg, warehouse.ratePerKgPerDay, days, warehouse.minBookingDays))}
            </span>
          </p>
        </div>
      ) : (
        <p className="flex items-center gap-2 text-sm text-forest-foreground/80">
          <PackageIcon className="size-4" aria-hidden />
          Add a quantity to see the estimated cost.
        </p>
      )}

      {warehouse.status !== "APPROVED" ? (
        <p className="text-sm text-forest-foreground/80">This warehouse isn&apos;t accepting bookings yet.</p>
      ) : status === "loading" ? (
        <Skeleton className="h-11 rounded-full bg-forest-foreground/15" />
      ) : status === "authenticated" && role !== "FARMER" ? (
        <p className="text-sm text-forest-foreground/80">Only farmer accounts can book storage.</p>
      ) : canBook && href ? (
        <Button size="lg" className="h-11 rounded-full bg-harvest text-harvest-foreground hover:bg-harvest/90" asChild>
          <Link href={status === "guest" ? `/login?${new URLSearchParams({ redirect: href }).toString()}` : href}>
            {status === "guest" ? (
              <>
                <LogInIcon data-icon="inline-start" aria-hidden />
                Log in to book
              </>
            ) : (
              <>
                Book chamber {chamber?.name}
                <ArrowRightIcon data-icon="inline-end" aria-hidden />
              </>
            )}
          </Link>
        </Button>
      ) : (
        <p className="text-sm text-forest-foreground/80">Pick a chamber with enough free space to continue.</p>
      )}
    </div>
  )
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-xl bg-harvest/15 px-3 py-2 text-sm">
      <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-harvest-foreground dark:text-harvest" aria-hidden />
      {children}
    </p>
  )
}

function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-2 border-t border-soil/10 pt-4" aria-label="Checking availability">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-20 rounded-2xl" />
      <Skeleton className="h-20 rounded-2xl" />
    </div>
  )
}
