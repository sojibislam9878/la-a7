import { z } from "zod"

const rate = z
  .string()
  .trim()
  .refine((value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0), {
    error: "Enter a valid rate",
  })

export const warehouseFilterFormSchema = z
  .object({
    district: z.string(),
    cropTypeId: z.string(),
    minCapacityKg: z.string(),
    minRating: z.string(),
    minRate: rate,
    maxRate: rate,
  })
  .refine(
    (values) => values.minRate === "" || values.maxRate === "" || Number(values.maxRate) >= Number(values.minRate),
    { error: "Max must be at least the min", path: ["maxRate"] }
  )

export type WarehouseFilterFormValues = z.infer<typeof warehouseFilterFormSchema>
