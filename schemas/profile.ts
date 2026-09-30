import { z } from "zod"

import { DISTRICTS } from "@/constants/districts"
import { BANGLADESHI_PHONE, passwordSchema } from "@/schemas/auth"

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

export const ownerProfileSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, { error: "Business name must be at least 2 characters" })
    .max(120, { error: "Business name must be at most 120 characters" }),
  tradeLicenseNo: z
    .string()
    .trim()
    .min(4, { error: "Trade license number must be at least 4 characters" })
    .max(40, { error: "Trade license number must be at most 40 characters" }),
  nid: z
    .string()
    .trim()
    .regex(/^(\d{10}|\d{13}|\d{17})$/, { error: "NID must be 10, 13 or 17 digits" }),
  district: z
    .string()
    .refine((value) => (DISTRICTS as readonly string[]).includes(value), { error: "Choose the district of your business" }),
  address: z
    .string()
    .trim()
    .min(5, { error: "Address must be at least 5 characters" })
    .max(255, { error: "Address must be at most 255 characters" }),
})

export type OwnerProfileValues = z.infer<typeof ownerProfileSchema>

export const passwordFormSchema = (hasPassword: boolean) =>
  z
    .object({
      currentPassword: hasPassword ? z.string().min(1, { error: "Enter your current password" }) : z.string(),
      newPassword: passwordSchema,
      confirmPassword: z.string().min(1, { error: "Please confirm your new password" }),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      error: "Passwords don't match",
      path: ["confirmPassword"],
    })
    .refine((values) => !hasPassword || values.newPassword !== values.currentPassword, {
      error: "Choose a password different from your current one",
      path: ["newPassword"],
    })

export type PasswordFormValues = z.infer<ReturnType<typeof passwordFormSchema>>
