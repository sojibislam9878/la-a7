import { z } from "zod"

import { DISTRICTS } from "@/constants/districts"
import { BANGLADESHI_PHONE } from "@/schemas/auth"

const KEEP_MESSAGE = "This can be changed but not removed."

function optionalText({
  locked,
  isValid,
  message,
}: {
  locked: boolean
  isValid: (value: string) => boolean
  message: string
}) {
  return z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value === "") {
        if (locked) ctx.addIssue({ code: "custom", message: KEEP_MESSAGE })
        return
      }
      if (!isValid(value)) ctx.addIssue({ code: "custom", message })
    })
}

export function createAccountSchema({ phoneLocked = false }: { phoneLocked?: boolean } = {}) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, { error: "Name must be at least 2 characters" })
      .max(80, { error: "Name must be at most 80 characters" }),
    phone: optionalText({
      locked: phoneLocked,
      isValid: (value) => BANGLADESHI_PHONE.test(value),
      message: "Enter a valid Bangladeshi number, e.g. 01712345678",
    }),
  })
}

export type AccountValues = z.infer<ReturnType<typeof createAccountSchema>>

type FarmerLocks = { upazila?: boolean; nid?: boolean; farmSizeAcre?: boolean }

export function createFarmerProfileSchema(locks: FarmerLocks = {}) {
  return z.object({
    district: z
      .string()
      .refine((value) => (DISTRICTS as readonly string[]).includes(value), { error: "Choose your district" }),
    upazila: optionalText({
      locked: !!locks.upazila,
      isValid: (value) => value.length >= 2 && value.length <= 60,
      message: "Upazila must be 2 to 60 characters",
    }),
    nid: optionalText({
      locked: !!locks.nid,
      isValid: (value) => /^(\d{10}|\d{13}|\d{17})$/.test(value),
      message: "NID must be 10, 13 or 17 digits",
    }),
    farmSizeAcre: optionalText({
      locked: !!locks.farmSizeAcre,
      isValid: (value) => /^\d+(\.\d{1,2})?$/.test(value) && Number(value) > 0 && Number(value) <= 999999,
      message: "Enter the size in acres, e.g. 2.5",
    }),
  })
}

export type FarmerProfileValues = z.infer<ReturnType<typeof createFarmerProfileSchema>>

export const DELETE_CONFIRMATION = "DELETE"

export const deleteAccountSchema = z.object({
  password: z.string(),
  confirmation: z
    .string()
    .trim()
    .refine((value): boolean => value === DELETE_CONFIRMATION, { error: `Type ${DELETE_CONFIRMATION} to confirm` }),
})

export type DeleteAccountValues = z.infer<typeof deleteAccountSchema>
