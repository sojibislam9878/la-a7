import { differenceInCalendarDays, isValid, parseISO } from "date-fns"
import { z } from "zod"

export const MAX_WINDOW_DAYS = 365
export const DAILY_BREAKDOWN_MAX_DAYS = 92

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => isValid(parseISO(value)))
const optional = <T extends z.ZodType>(schema: T) => schema.optional().catch(undefined)

const schema = z.object({
  from: optional(isoDate),
  to: optional(isoDate),
  crop: optional(z.uuid()),
  qty: optional(z.coerce.number().int().positive().max(10_000_000)),
  chamber: optional(z.uuid()),
})

export type AvailabilitySelection = z.infer<typeof schema>

export function parseAvailabilitySelection(params: URLSearchParams): AvailabilitySelection {
  const record: Record<string, string> = {}
  params.forEach((value, key) => {
    if (value !== "") record[key] = value
  })
  const selection = schema.parse(record)
  if (selection.from && selection.to) {
    const days = inclusiveDays(selection.from, selection.to)
    if (days < 1 || days > MAX_WINDOW_DAYS + 1) {
      delete selection.from
      delete selection.to
    }
  } else {
    delete selection.from
    delete selection.to
  }
  return selection
}

export function inclusiveDays(from: string, to: string) {
  return differenceInCalendarDays(parseISO(to), parseISO(from)) + 1
}

export function billableDays(days: number, minBookingDays: number) {
  return Math.max(days, minBookingDays)
}

export function estimateCost(quantityKg: number, ratePerKgPerDay: number, days: number, minBookingDays: number) {
  return quantityKg * ratePerKgPerDay * billableDays(days, minBookingDays)
}

export function bookingHref(input: {
  warehouseId: string
  chamberId: string
  from: string
  to: string
  cropTypeId?: string
  quantityKg?: number
}) {
  const params = new URLSearchParams({
    warehouseId: input.warehouseId,
    chamberId: input.chamberId,
    startDate: input.from,
    endDate: input.to,
  })
  if (input.cropTypeId) params.set("cropTypeId", input.cropTypeId)
  if (input.quantityKg) params.set("quantityKg", String(input.quantityKg))
  return `/farmer/bookings/new?${params.toString()}`
}
