import { z } from "zod"

export const inspectionSchema = z
  .object({
    grade: z.string().refine((value): boolean => ["A", "B", "C", "REJECTED"].includes(value), {
      error: "Choose a grade",
    }),
    actualQtyKg: z
      .string()
      .trim()
      .refine((value) => /^\d+$/.test(value) && Number(value) > 0 && Number(value) <= 10_000_000, {
        error: "Enter the weighed quantity in whole kg",
      }),
    moisturePct: z
      .string()
      .trim()
      .refine((value) => value === "" || (/^\d{1,3}(\.\d)?$/.test(value) && Number(value) <= 100), {
        error: "Enter moisture between 0 and 100%, or leave it empty",
      }),
    notes: z.string().trim().max(500, { error: "Keep notes under 500 characters" }),
  })
  .superRefine((values, ctx) => {
    if (values.grade === "REJECTED" && values.notes.length < 3) {
      ctx.addIssue({ code: "custom", path: ["notes"], message: "Say why the lot was rejected. The farmer sees this." })
    } else if (values.notes.length > 0 && values.notes.length < 3) {
      ctx.addIssue({ code: "custom", path: ["notes"], message: "Write at least 3 characters, or leave it empty" })
    }
  })

export type InspectionValues = z.infer<typeof inspectionSchema>
