import { z } from "zod"

import { DISTRICTS } from "@/constants/districts"

export const warehouseFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { error: "Name must be at least 3 characters" })
    .max(120, { error: "Name must be at most 120 characters" }),
  licenseNo: z
    .string()
    .trim()
    .min(4, { error: "License number must be at least 4 characters" })
    .max(40, { error: "License number must be at most 40 characters" }),
  district: z
    .string()
    .refine((value) => (DISTRICTS as readonly string[]).includes(value), { error: "Choose the warehouse district" }),
  address: z
    .string()
    .trim()
    .min(5, { error: "Address must be at least 5 characters" })
    .max(255, { error: "Address must be at most 255 characters" }),
  ratePerKgPerDay: z
    .string()
    .trim()
    .refine((value) => /^\d+(\.\d{1,4})?$/.test(value) && Number(value) > 0, {
      error: "Enter a rate above 0, up to 4 decimals, e.g. 0.055",
    })
    .refine((value) => Number(value) <= 1000, { error: "That rate is unrealistically high" }),
  minBookingDays: z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 365, {
      error: "Enter whole days between 1 and 365",
    }),
})

export type WarehouseFormValues = z.infer<typeof warehouseFormSchema>
