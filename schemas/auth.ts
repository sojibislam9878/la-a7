import { z } from "zod"

export const BANGLADESHI_PHONE = /^(?:\+?880|0)1[3-9]\d{8}$/

export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { id: "letter", label: "At least one letter", test: (value: string) => /[A-Za-z]/.test(value) },
  { id: "number", label: "At least one number", test: (value: string) => /\d/.test(value) },
] as const

export const passwordSchema = z
  .string()
  .min(8, { error: "Password must be at least 8 characters" })
  .max(72, { error: "Password must be at most 72 characters" })
  .regex(/[A-Za-z]/, { error: "Password must contain at least one letter" })
  .regex(/\d/, { error: "Password must contain at least one number" })

export const emailSchema = z
  .string()
  .trim()
  .min(1, { error: "Email is required" })
  .max(255, { error: "Email must be at most 255 characters" })
  .pipe(z.email({ error: "Enter a valid email address" }))

export const registerSchema = z
  .object({
    role: z.enum(["FARMER", "WAREHOUSE_OWNER"], { error: "Choose an account type" }),
    name: z
      .string()
      .trim()
      .min(2, { error: "Name must be at least 2 characters" })
      .max(80, { error: "Name must be at most 80 characters" }),
    email: emailSchema,
    phone: z
      .string()
      .trim()
      .refine((value) => value === "" || BANGLADESHI_PHONE.test(value), {
        error: "Enter a valid Bangladeshi number, e.g. 01712345678",
      }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, { error: "Please confirm your password" }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: "Password is required" }),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const OTP_LENGTH = 6

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z
    .string()
    .trim()
    .regex(/^\d+$/, { error: "The code contains digits only" })
    .length(OTP_LENGTH, { error: `Enter the ${OTP_LENGTH}-digit code` }),
})

export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>
