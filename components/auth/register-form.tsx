"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircleIcon, ArrowRightIcon, Loader2Icon, MailIcon, PhoneIcon, UserRoundIcon } from "lucide-react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { AuthInput } from "@/components/auth/auth-input"
import { GoogleButton } from "@/components/auth/google-button"
import { OrDivider } from "@/components/auth/or-divider"
import { PasswordChecklist } from "@/components/auth/password-checklist"
import { PasswordInput } from "@/components/auth/password-input"
import { RoleSelector } from "@/components/auth/role-selector"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { useSignup } from "@/hooks/use-auth-mutations"
import { markOtpSent } from "@/hooks/use-otp-cooldown"
import { ApiError } from "@/lib/api/client"
import { applyServerFieldErrors, getErrorMessage } from "@/lib/api/form-errors"
import { registerSchema, type RegisterFormValues } from "@/schemas/auth"
import type { SelfServiceRole } from "@/types/user"

const SERVER_FIELDS = ["name", "email", "phone", "password", "role"] as const

function verifyOtpUrl(email: string, extra?: Record<string, string>) {
  const params = new URLSearchParams({ email, ...extra })
  return `/verify-otp?${params.toString()}`
}

export function RegisterForm({ defaultRole }: { defaultRole: SelfServiceRole }) {
  const router = useRouter()
  const signup = useSignup()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      role: defaultRole,
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  })
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = form

  const role = useWatch({ control, name: "role" })
  const password = useWatch({ control, name: "password" })

  const onSubmit = handleSubmit((values) => {
    const email = values.email.toLowerCase()

    signup.mutate(
      {
        name: values.name,
        email,
        password: values.password,
        role: values.role,
        // Backend rejects unknown keys and empty phones, so only send it when filled
        ...(values.phone ? { phone: values.phone } : {}),
      },
      {
        onSuccess: () => {
          markOtpSent(email)
          toast.success("Account created", {
            description: `We sent a 6-digit verification code to ${email}.`,
          })
          router.push(verifyOtpUrl(email))
        },
        onError: (error) => {
          // The account is created before the email is sent, so a mail failure
          // still leaves a valid (unverified) account: continue to verification.
          if (error instanceof ApiError && error.status === 502) {
            toast.warning("Account created, but the code could not be sent", {
              description: "Request a new code on the next page.",
            })
            router.push(verifyOtpUrl(email, { sent: "0" }))
            return
          }

          if (error instanceof ApiError && error.status === 409) {
            setError("email", { type: "server", message: error.message }, { shouldFocus: true })
            return
          }

          if (applyServerFieldErrors(error, setError, SERVER_FIELDS)) return

          setError("root", { type: "server", message: getErrorMessage(error) })
        },
      }
    )
  })

  const emailTaken = errors.email?.type === "server" && signup.error instanceof ApiError && signup.error.status === 409
  const pending = signup.isPending

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {errors.root && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Could not create your account</AlertTitle>
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <FieldSet>
          <FieldLegend variant="label">Account type</FieldLegend>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <RoleSelector value={field.value} onChange={field.onChange} invalid={!!errors.role} />
            )}
          />
          <FieldError errors={[errors.role]} />
        </FieldSet>

        <Field data-invalid={!!errors.name || undefined}>
          <FieldLabel htmlFor="name">{role === "WAREHOUSE_OWNER" ? "Full name or business name" : "Full name"}</FieldLabel>
          <AuthInput
            icon={UserRoundIcon}
            id="name"
            autoComplete="name"
            placeholder={role === "WAREHOUSE_OWNER" ? "Karim Cold Storage" : "Rahim Uddin"}
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={!!errors.email || undefined}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <AuthInput
              icon={MailIcon}
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
            {emailTaken && (
              <FieldDescription>
                Already registered? <Link href="/login">Log in instead</Link>
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={!!errors.phone || undefined}>
            <FieldLabel htmlFor="phone">
              Phone <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <AuthInput
              icon={PhoneIcon}
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="01712345678"
              aria-invalid={!!errors.phone}
              {...register("phone")}
            />
            <FieldError errors={[errors.phone]} />
          </Field>
        </div>

        <Field data-invalid={!!errors.password || undefined}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby="password-rules"
            {...register("password")}
          />
          <PasswordChecklist id="password-rules" value={password} />
          <FieldError errors={[errors.password]} />
        </Field>

        <Field data-invalid={!!errors.confirmPassword || undefined}>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full rounded-full text-base shadow-lg shadow-primary/20"
        disabled={pending}
      >
        {pending ? (
          <>
            <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />
            Creating account...
          </>
        ) : (
          <>
            Create account
            <ArrowRightIcon data-icon="inline-end" aria-hidden />
          </>
        )}
      </Button>

      {role === "FARMER" && (
        <>
          <OrDivider />
          <GoogleButton label="Sign up with Google" />
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  )
}
