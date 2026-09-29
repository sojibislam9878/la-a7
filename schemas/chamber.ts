import { z } from "zod"

const TEMP = /^-?\d{1,2}(\.\d)?$/

const temperature = z
  .string()
  .trim()
  .refine((value) => TEMP.test(value) && Number(value) >= -40 && Number(value) <= 40, {
    error: "Enter °C between -40 and 40, e.g. 2 or -1.5",
  })

export const chamberFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { error: "Give the chamber a name, e.g. A-1" })
      .max(60, { error: "Name must be at most 60 characters" }),
    capacityKg: z
      .string()
      .trim()
      .refine((value) => /^\d+$/.test(value) && Number(value) > 0 && Number(value) <= 10_000_000, {
        error: "Enter whole kg above 0, up to 10,000,000",
      }),
    minTempC: temperature,
    maxTempC: temperature,
  })
  .refine(
    (values) => !TEMP.test(values.minTempC) || !TEMP.test(values.maxTempC) || Number(values.maxTempC) >= Number(values.minTempC),
    { error: "Max must be at or above the min temperature", path: ["maxTempC"] }
  )

export type ChamberFormValues = z.infer<typeof chamberFormSchema>
