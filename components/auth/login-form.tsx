"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircleIcon, ArrowRightIcon, Loader2Icon, MailCheckIcon, MailIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { AuthInput } from "@/components/auth/auth-input"
import { DemoLogin } from "@/components/auth/demo-login"
import { GoogleButton } from "@/components/auth/google-button"
import { OrDivider } from "@/components/auth/or-divider"
import { PasswordInput } from "@/components/auth/password-input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import type { DemoAccount } from "@/constants/demo-accounts"
import { ROLE_HOME } from "@/constants/routes"
import { useLogin } from "@/hooks/use-auth-mutations"
import { ApiError } from "@/lib/api/client"
import { applyServerFieldErrors, getErrorMessage } from "@/lib/api/form-errors"
import { loginSchema, type LoginFormValues } from "@/schemas/auth"
import type { Role } from "@/types/user"

type LoginNotice =
  | { kind: "error"; title: string; message: string }
  | { kind: "unverified"; email: string }
  | { kind: "google" }

function toNotice(error: unknown, email: string): LoginNotice {
  if (error instanceof ApiError) {
    if (error.status === 403 && /verif/i.test(error.message)) return { kind: "unverified", email }
    if (error.status === 409) return { kind: "google" }
    if (error.status === 401) {
      return { kind: "error", title: "Login failed", message: "The email or password is incorrect." }
    }
    if (error.status === 403) return { kind: "error", title: "Account unavailable", message: error.message }
  }
  return { kind: "error", title: "Login failed", message: getErrorMessage(error) }
}

export function LoginForm({ redirectTo, defaultEmail }: { redirectTo: string | null; defaultEmail?: string }) {
  const router = useRouter()
  const login = useLogin()
  const [notice, setNotice] = useState<LoginNotice | null>(null)
  const [pendingDemo, setPendingDemo] = useState<Role | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: defaultEmail ?? "", password: "" },
  })

  function signIn(email: string, password: string, demoRole: Role | null = null) {
    setNotice(null)
    setPendingDemo(demoRole)

    login.mutate(
      { email: email.toLowerCase(), password },
      {
        onSuccess: ({ data }) => {
          toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`)
          router.replace(redirectTo ?? ROLE_HOME[data.user.role])
        },
        onError: (error) => {
          if (!demoRole && applyServerFieldErrors(error, setError, ["email", "password"])) return
          setNotice(toNotice(error, email))
        },
        onSettled: () => setPendingDemo(null),
      }
    )
  }

  const onSubmit = handleSubmit((values) => signIn(values.email, values.password))
  const onDemo = (account: DemoAccount) => signIn(account.email, account.password, account.role)

  const pending = login.isPending
  const formPending = pending && pendingDemo === null

  return (
    <div className="flex flex-col gap-6">
      {notice && <NoticeAlert notice={notice} />}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <FieldGroup>
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
          </Field>

          <Field data-invalid={!!errors.password || undefined}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <FieldError errors={[errors.password]} />
          </Field>
        </FieldGroup>

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-full text-base shadow-lg shadow-primary/20"
          disabled={pending}
        >
          {formPending ? (
            <>
              <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />
              Logging in...
            </>
          ) : (
            <>
              Log in
              <ArrowRightIcon data-icon="inline-end" aria-hidden />
            </>
          )}
        </Button>
      </form>

      <OrDivider />
      <GoogleButton label="Continue with Google" />
      <p className="-mt-3 text-center text-xs text-muted-foreground">Google sign-in is available for farmer accounts.</p>

      <DemoLogin onSelect={onDemo} pendingRole={pendingDemo} disabled={pending} />

      <p className="text-center text-sm text-muted-foreground">
        New to AgroStore?{" "}
        <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}

function NoticeAlert({ notice }: { notice: LoginNotice }) {
  if (notice.kind === "unverified") {
    return (
      <Alert className="border-harvest/40 bg-harvest/10">
        <MailCheckIcon />
        <AlertTitle>Verify your email first</AlertTitle>
        <AlertDescription>
          <p>Enter the 6-digit code we emailed you to activate your account.</p>
          <Button size="sm" className="mt-2 rounded-full no-underline! hover:text-primary-foreground!" asChild>
            <Link href={`/verify-otp?${new URLSearchParams({ email: notice.email }).toString()}`}>
              Verify email
              <ArrowRightIcon data-icon="inline-end" aria-hidden />
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (notice.kind === "google") {
    return (
      <Alert>
        <AlertCircleIcon />
        <AlertTitle>This account uses Google sign-in</AlertTitle>
        <AlertDescription>
          It was created with Google and has no password yet. Use &ldquo;Continue with Google&rdquo; below.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{notice.title}</AlertTitle>
      <AlertDescription>{notice.message}</AlertDescription>
    </Alert>
  )
}
