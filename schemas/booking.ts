import { addDays, format, parseISO } from "date-fns"
import { z } from "zod"

import { inclusiveDays } from "@/lib/availability-query"
import type { CropType } from "@/types/crop-type"
import type { Chamber } from "@/types/warehouse"

export const MAX_ADVANCE_DAYS = 90

export type BookingRules = {
  today: string
  minBookingDays: number
  chambers: Chamber[]
  cropTypes: CropType[]
}

export function latestStartDate(today: string) {
  return format(addDays(parseISO(today), MAX_ADVANCE_DAYS), "yyyy-MM-dd")
}

export function cropFitsChamber(crop: CropType, chamber: Pick<Chamber, "minTempC" | "maxTempC">) {
  return chamber.minTempC <= crop.idealMinTempC && chamber.maxTempC >= crop.idealMaxTempC
}

export function createBookingSchema(rules: BookingRules) {
  const latestStart = latestStartDate(rules.today)

  return z
    .object({
      chamberId: z.string().min(1, { error: "Choose a chamber" }),
      cropTypeId: z.string().min(1, { error: "Choose what you're storing" }),
      quantityKg: z
        .string()
        .trim()
        .min(1, { error: "Enter the quantity in kg" })
        .regex(/^\d+$/, { error: "Use a whole number of kg" })
        .refine((value) => Number(value) > 0, { error: "Quantity must be more than 0 kg" })
        .refine((value) => Number(value) <= 10_000_000, { error: "That quantity is unrealistically large" }),
      startDate: z.string().min(1, { error: "Pick your storage dates" }),
      endDate: z.string().min(1, { error: "Pick an end date" }),
    })
    .superRefine((values, ctx) => {
      const crop = rules.cropTypes.find((c) => c.id === values.cropTypeId)
      const chamber = rules.chambers.find((c) => c.id === values.chamberId)

      if (crop && chamber && !cropFitsChamber(crop, chamber)) {
        ctx.addIssue({
          code: "custom",
          path: ["cropTypeId"],
          message: `${crop.name} needs ${crop.idealMinTempC} to ${crop.idealMaxTempC}°C, but chamber ${chamber.name} runs ${chamber.minTempC} to ${chamber.maxTempC}°C`,
        })
      }

      if (!values.startDate || !values.endDate) return

      if (values.startDate < rules.today) {
        ctx.addIssue({ code: "custom", path: ["startDate"], message: "The start date can't be in the past" })
        return
      }
      if (values.startDate > latestStart) {
        ctx.addIssue({
          code: "custom",
          path: ["startDate"],
          message: `You can book up to ${MAX_ADVANCE_DAYS} days ahead (start by ${format(parseISO(latestStart), "MMM d")})`,
        })
        return
      }
      if (values.endDate < values.startDate) {
        ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date must be on or after the start date" })
        return
      }

      const days = inclusiveDays(values.startDate, values.endDate)
      if (days < rules.minBookingDays) {
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: `This warehouse needs at least ${rules.minBookingDays} days, you picked ${days}`,
        })
      } else if (crop && days > crop.maxStorageDays) {
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: `${crop.name} can be stored for at most ${crop.maxStorageDays} days, you picked ${days}`,
        })
      }
    })
}

export type BookingFormValues = z.infer<ReturnType<typeof createBookingSchema>>
