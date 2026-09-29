import { z } from "zod"

const TEMP = /^-?\d{1,2}(\.\d)?$/

const temperature = z
  .string()
  .trim()
  .refine((value) => TEMP.test(value) && Number(value) >= -40 && Number(value) <= 40, {
    error: "Enter °C between -40 and 40, e.g. 4 or -1.5",
  })

export const cropTypeFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { error: "Name must be at least 2 characters" })
      .max(60, { error: "Name must be at most 60 characters" }),
    idealMinTempC: temperature,
    idealMaxTempC: temperature,
    maxStorageDays: z
      .string()
      .trim()
      .refine((value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 730, {
        error: "Enter whole days between 1 and 730",
      }),
  })
  .refine(
    (values) =>
      !TEMP.test(values.idealMinTempC) ||
      !TEMP.test(values.idealMaxTempC) ||
      Number(values.idealMaxTempC) >= Number(values.idealMinTempC),
    { error: "Max must be at or above the min temperature", path: ["idealMaxTempC"] }
  )

export type CropTypeFormValues = z.infer<typeof cropTypeFormSchema>
