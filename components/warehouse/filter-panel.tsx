"use client"

import { useCallback, useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { RotateCcwIcon, StarIcon } from "lucide-react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DISTRICTS } from "@/constants/districts"
import { useWarehouseQuery } from "@/hooks/use-warehouse-query"
import { cn } from "@/lib/utils"
import { CAPACITY_OPTIONS, countActiveFilters, RATING_OPTIONS } from "@/lib/warehouse-query"
import { warehouseFilterFormSchema, type WarehouseFilterFormValues } from "@/schemas/warehouse-filters"
import type { CropType } from "@/types/crop-type"
import type { WarehouseQuery } from "@/types/warehouse"

const ANY = "any"
const APPLY_DELAY_MS = 350

const triggerClass = "h-10! w-full rounded-xl border-soil/15 bg-card"
const inputClass = "h-10 rounded-xl border-soil/15 bg-card"

function toFormValues(query: WarehouseQuery): WarehouseFilterFormValues {
  const str = (value: number | string | undefined) => (value === undefined ? "" : String(value))
  return {
    district: query.district ?? "",
    cropTypeId: query.cropTypeId ?? "",
    minCapacityKg: str(query.minCapacityKg),
    minRating: str(query.minRating),
    minRate: str(query.minRate),
    maxRate: str(query.maxRate),
  }
}

const num = (value: string) => (value === "" ? undefined : Number(value))

/**
 * Filters apply automatically (debounced) and live in the URL. React Hook Form
 * + Zod validate them first, so an impossible rate range never reaches the API.
 */
export function FilterPanel({ cropTypes, className }: { cropTypes: CropType[]; className?: string }) {
  const { query, update } = useWarehouseQuery()
  const urlValues = useMemo(() => toFormValues(query), [query])

  const form = useForm<WarehouseFilterFormValues>({
    resolver: zodResolver(warehouseFilterFormSchema),
    defaultValues: urlValues,
    mode: "onChange",
  })
  const {
    control,
    register,
    reset,
    getValues,
    handleSubmit,
    subscribe,
    formState: { errors },
  } = form

  // URL → form, when something else changed the URL (chips, back button)
  useEffect(() => {
    if (JSON.stringify(getValues()) !== JSON.stringify(urlValues)) reset(urlValues)
  }, [urlValues, getValues, reset])

  const apply = useCallback(
    (values: WarehouseFilterFormValues) =>
      update({
        district: values.district || undefined,
        cropTypeId: values.cropTypeId || undefined,
        minCapacityKg: num(values.minCapacityKg),
        minRating: num(values.minRating),
        minRate: num(values.minRate),
        maxRate: num(values.maxRate),
      }),
    [update]
  )

  // Form → URL, debounced; `reset` events have no `type` and are ignored
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const unsubscribe = subscribe({
      formState: { values: true },
      callback: ({ type }) => {
        if (type !== "change") return
        clearTimeout(timer)
        timer = setTimeout(() => void handleSubmit(apply)(), APPLY_DELAY_MS)
      },
    })
    return () => {
      unsubscribe()
      clearTimeout(timer)
    }
  }, [subscribe, handleSubmit, apply])

  const activeCount = countActiveFilters(query)

  return (
    <form
      onSubmit={handleSubmit(apply)}
      noValidate
      aria-label="Warehouse filters"
      className={cn("flex flex-col gap-6", className)}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        {activeCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full text-muted-foreground"
            onClick={() =>
              update({
                district: undefined,
                cropTypeId: undefined,
                minCapacityKg: undefined,
                minRating: undefined,
                minRate: undefined,
                maxRate: undefined,
              })
            }
          >
            <RotateCcwIcon data-icon="inline-start" aria-hidden />
            Reset
          </Button>
        )}
      </div>

      <FieldGroup className="gap-5">
        <Field>
          <FieldLabel htmlFor="filter-district">District</FieldLabel>
          <Controller
            control={control}
            name="district"
            render={({ field }) => (
              <Select value={field.value || ANY} onValueChange={(v) => field.onChange(v === ANY ? "" : v)}>
                <SelectTrigger id="filter-district" className={triggerClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-72">
                  <SelectItem value={ANY}>All districts</SelectItem>
                  {DISTRICTS.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="filter-crop">Crop</FieldLabel>
          <Controller
            control={control}
            name="cropTypeId"
            render={({ field }) => (
              <Select value={field.value || ANY} onValueChange={(v) => field.onChange(v === ANY ? "" : v)}>
                <SelectTrigger id="filter-crop" className={triggerClass}>
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
          <p className="text-xs text-muted-foreground">Only chambers cold enough for this crop.</p>
        </Field>

        <Field>
          <FieldLabel htmlFor="filter-capacity">Chamber capacity</FieldLabel>
          <Controller
            control={control}
            name="minCapacityKg"
            render={({ field }) => (
              <Select value={field.value || ANY} onValueChange={(v) => field.onChange(v === ANY ? "" : v)}>
                <SelectTrigger id="filter-capacity" className={triggerClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value={ANY}>Any size</SelectItem>
                  {CAPACITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <FieldSet className="gap-2">
          <FieldLegend variant="label" className="mb-0">
            Rate (৳ per kg per day)
          </FieldLegend>
          <div className="grid grid-cols-2 gap-2">
            <Field data-invalid={!!errors.minRate || undefined}>
              <FieldLabel htmlFor="filter-min-rate" className="sr-only">
                Minimum rate
              </FieldLabel>
              <Input
                id="filter-min-rate"
                inputMode="decimal"
                placeholder="Min"
                className={inputClass}
                aria-invalid={!!errors.minRate}
                {...register("minRate")}
              />
            </Field>
            <Field data-invalid={!!errors.maxRate || undefined}>
              <FieldLabel htmlFor="filter-max-rate" className="sr-only">
                Maximum rate
              </FieldLabel>
              <Input
                id="filter-max-rate"
                inputMode="decimal"
                placeholder="Max"
                className={inputClass}
                aria-invalid={!!errors.maxRate}
                {...register("maxRate")}
              />
            </Field>
          </div>
          <FieldError errors={[errors.minRate, errors.maxRate]} />
          <p className="text-xs text-muted-foreground">Most warehouses charge ৳0.03 to ৳0.06.</p>
        </FieldSet>

        <FieldSet className="gap-2">
          <FieldLegend variant="label" className="mb-0">
            Rating
          </FieldLegend>
          <Controller
            control={control}
            name="minRating"
            render={({ field }) => (
              <RadioGroupPrimitive.Root
                value={field.value || ANY}
                onValueChange={(v) => field.onChange(v === ANY ? "" : v)}
                className="flex flex-wrap gap-2"
              >
                {[{ value: ANY, label: "Any" }, ...RATING_OPTIONS].map((option) => (
                  <RadioGroupPrimitive.Item
                    key={option.value}
                    value={option.value}
                    className="flex h-8 items-center gap-1 rounded-full border border-soil/15 bg-card px-3 text-sm transition-colors outline-none hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  >
                    {option.value !== ANY && <StarIcon className="size-3.5 fill-current" aria-hidden />}
                    {option.label}
                  </RadioGroupPrimitive.Item>
                ))}
              </RadioGroupPrimitive.Root>
            )}
          />
        </FieldSet>
      </FieldGroup>
    </form>
  )
}
