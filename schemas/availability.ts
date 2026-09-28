import { z } from "zod"

import { inclusiveDays, MAX_WINDOW_DAYS } from "@/lib/availability-query"

export const availabilityFormSchema = z
  .object({
    startDate: z.string().min(1, { error: "Pick your storage dates" }),
    endDate: z.string().min(1, { error: "Pick an end date" }),
    cropTypeId: z.string(),
    quantityKg: z
      .string()
      .trim()
      .refine((value) => value === "" || /^\d+$/.test(value), { error: "Use a whole number of kg" })
      .refine((value) => value === "" || Number(value) > 0, { error: "Quantity must be more than 0 kg" })
      .refine((value) => value === "" || Number(value) <= 10_000_000, { error: "That quantity is unrealistically large" }),
  })
  .refine((values) => !values.startDate || !values.endDate || values.endDate >= values.startDate, {
    error: "End date must be on or after the start date",
    path: ["endDate"],
  })
  .refine(
    (values) =>
      !values.startDate || !values.endDate || inclusiveDays(values.startDate, values.endDate) <= MAX_WINDOW_DAYS + 1,
    { error: "Check at most one year at a time", path: ["endDate"] }
  )

export type AvailabilityFormValues = z.infer<typeof availabilityFormSchema>
