"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CheckIcon,
  Loader2Icon,
  MailIcon,
  PencilIcon,
  RotateCwIcon,
} from "lucide-react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { AuthInput } from "@/components/auth/auth-input"
import { Leaf } from "@/components/shared/leaf"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { useResendOtp, useVerifyOtp } from "@/hooks/use-auth-mutations"
import { useOtpCooldown } from "@/hooks/use-otp-cooldown"
import { ApiError } from "@/lib/api/client"
import { applyServerFieldErrors, getErrorMessage } from "@/lib/api/form-errors"
import { OTP_LENGTH, verifyOtpSchema, type VerifyOtpFormValues } from "@/schemas/auth"

type Notice =
  | { kind: "error"; title: string; message: string; action?: "resend" | "register" }
  | { kind: "already-verified" }
  | { kind: "not-sent" }

const slotClass =
  "size-11 rounded-xl border border-soil/15 bg-cream/60 text-lg font-semibold first:rounded-l-xl last:rounded-r-xl sm:size-13 sm:text-xl dark:bg-input/20"

function loginUrl(email: string) {
  return `/login?${new URLSearchParams({ email }).toString()}`
}

export function VerifyOtpForm({ defaultEmail, codeNotSent }: { defaultEmail: string; codeNotSent: boolean }) {
  const verify = useVerifyOtp()
  const resend = useResendOtp()
  const [editingEmail, setEditingEmail] = useState(!defaultEmail)
  const [notice, setNotice] = useState<Notice | null>(codeNotSent ? { kind: "not-sent" } : null)
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    setFocus,
    trigger,
    formState: { errors },
  } = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email: defaultEmail, otp: "" },
  })

  const email = useWatch({ control, name: "email" }).trim().toLowerCase()
  const cooldown = useOtpCooldown(email || null)

  const onSubmit = handleSubmit((values) => {
    setNotice(null)
    verify.mutate(
      { email: values.email.toLowerCase(), otp: values.otp },
      {
        onSuccess: () => {
          toast.success("Email verified", { description: "You can now log in to your account." })
          setVerifiedEmail(values.email.toLowerCase())
        },
        onError: (error) => {
          setValue("otp", "")
          if (!(error instanceof ApiError)) {
            setNotice({ kind: "error", title: "Verification failed", message: getErrorMessage(error) })
            return
          }
          switch (error.status) {
            case 400:
              if (applyServerFieldErrors(error, setError, ["email", "otp"])) return
              setError("otp", { type: "server", message: error.message })
              setFocus("otp")
              return
            case 404:
              setNotice({ kind: "error", title: "No account found", message: error.message, action: "register" })
              return
            case 409:
              setNotice({ kind: "already-verified" })
              return
            case 410:
              setNotice({ kind: "error", title: "Code expired", message: error.message, action: "resend" })
              return
            case 429:
              setNotice({ kind: "error", title: "Too many attempts", message: error.message, action: "resend" })
              return
            default:
              setNotice({ kind: "error", title: "Verification failed", message: error.message })
          }
        },
      }
    )
  })

  async function onResend() {
    if (!(await trigger("email"))) return

    resend.mutate(
      { email },
      {
        onSuccess: () => {
          cooldown.start()
          setNotice(null)
          setValue("otp", "")
          toast.success("New code sent", { description: `Check the inbox for ${email}.` })
        },
        onError: (error) => {
          const wait = error instanceof ApiError ? /wait (\d+) seconds/i.exec(error.message) : null
          if (wait) {
            cooldown.start(Number(wait[1]))
            toast.info(error.message)
            return
          }
          toast.error("Couldn't send a new code", { description: getErrorMessage(error) })
        },
      }
    )
  }

  if (verifiedEmail) {
    return <VerifiedState email={verifiedEmail} />
  }

  const verifying = verify.isPending
  const resendLocked = cooldown.secondsLeft > 0 || resend.isPending

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {notice && (
        <NoticeAlert notice={notice} email={email} onResend={onResend} resendLocked={resendLocked} />
      )}

      <FieldGroup>
        {editingEmail ? (
          <Field data-invalid={!!errors.email || undefined}>
            <FieldLabel htmlFor="email">Email you signed up with</FieldLabel>
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
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-cream/70 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <MailIcon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Code sent to</p>
                <p className="truncate font-medium">{email}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 rounded-full"
              onClick={() => setEditingEmail(true)}
            >
              <PencilIcon data-icon="inline-start" aria-hidden />
              Change
            </Button>
          </div>
        )}

        <Field data-invalid={!!errors.otp || undefined}>
          <FieldLabel htmlFor="otp">Verification code</FieldLabel>
          <Controller
            control={control}
            name="otp"
            render={({ field }) => (
              <InputOTP
                id="otp"
                ref={field.ref}
                maxLength={OTP_LENGTH}
                pattern={REGEXP_ONLY_DIGITS}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus={!editingEmail}
                value={field.value}
                onChange={(value) => field.onChange(value)}
                onBlur={field.onBlur}
                onComplete={() => void onSubmit()}
                disabled={verifying}
                aria-invalid={!!errors.otp}
                containerClassName="justify-center gap-2 sm:gap-3"
              >
                <InputOTPGroup className="gap-2 sm:gap-3">
                  {[0, 1, 2].map((index) => (
                    <InputOTPSlot key={index} index={index} className={slotClass} aria-invalid={!!errors.otp} />
                  ))}
                </InputOTPGroup>
                <InputOTPSeparator className="text-soil/40" />
                <InputOTPGroup className="gap-2 sm:gap-3">
                  {[3, 4, 5].map((index) => (
                    <InputOTPSlot key={index} index={index} className={slotClass} aria-invalid={!!errors.otp} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            )}
          />
          <FieldError errors={[errors.otp]} className="text-center" />
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full rounded-full text-base shadow-lg shadow-primary/20"
        disabled={verifying}
      >
        {verifying ? (
          <>
            <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />
            Verifying...
          </>
        ) : (
          <>
            Verify email
            <ArrowRightIcon data-icon="inline-end" aria-hidden />
          </>
        )}
      </Button>

      <div className="flex flex-col items-center gap-1 text-sm">
        <p className="text-muted-foreground">Didn&apos;t get the code? Check your spam folder, or</p>
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 font-semibold"
          onClick={onResend}
          disabled={resendLocked}
          aria-live="polite"
        >
          {resend.isPending ? (
            <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />
          ) : (
            <RotateCwIcon data-icon="inline-start" aria-hidden />
          )}
          {cooldown.secondsLeft > 0 ? `Resend code in ${formatSeconds(cooldown.secondsLeft)}` : "Resend code"}
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already verified?{" "}
        <Link href={email ? loginUrl(email) : "/login"} className="font-medium text-primary underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  )
}

function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

function NoticeAlert({
  notice,
  email,
  onResend,
  resendLocked,
}: {
  notice: Notice
  email: string
  onResend: () => void
  resendLocked: boolean
}) {
  if (notice.kind === "not-sent") {
    return (
      <Alert className="border-harvest/40 bg-harvest/10">
        <AlertCircleIcon />
        <AlertTitle>Your account is ready, but the email didn&apos;t go out</AlertTitle>
        <AlertDescription>
          We couldn&apos;t send your verification code. Use &ldquo;Resend code&rdquo; below to try again.
        </AlertDescription>
      </Alert>
    )
  }

  if (notice.kind === "already-verified") {
    return (
      <Alert className="border-primary/30 bg-primary/5">
        <CheckIcon />
        <AlertTitle>This email is already verified</AlertTitle>
        <AlertDescription>
          <p>You can log in right away.</p>
          <Button size="sm" className="mt-2 rounded-full no-underline! hover:text-primary-foreground!" asChild>
            <Link href={loginUrl(email)}>
              Go to login
              <ArrowRightIcon data-icon="inline-end" aria-hidden />
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{notice.title}</AlertTitle>
      <AlertDescription>
        <p>{notice.message}</p>
        {notice.action === "resend" && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2 rounded-full"
            onClick={onResend}
            disabled={resendLocked}
          >
            <RotateCwIcon data-icon="inline-start" aria-hidden />
            Send a new code
          </Button>
        )}
        {notice.action === "register" && (
          <Button size="sm" variant="outline" className="mt-2 rounded-full no-underline! hover:text-primary-foreground!" asChild>
            <Link href="/register">Create an account</Link>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

function VerifiedState({ email }: { email: string }) {
  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center" role="status">
      <div className="relative">
        <Leaf className="absolute -top-4 -left-8 size-10 -rotate-45 text-primary/40" />
        <Leaf className="absolute -right-8 -bottom-2 size-9 rotate-[140deg] text-harvest/60" />
        <span className="flex size-20 items-center justify-center rounded-[58%_42%_52%_48%/55%_48%_52%_45%] bg-primary text-primary-foreground shadow-xl shadow-primary/30">
          <CheckIcon className="size-9" strokeWidth={3} aria-hidden />
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-2xl font-semibold">You&apos;re all set!</h2>
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">{email}</span> is verified. Log in to start using
          AgroStore.
        </p>
      </div>
      <Button size="lg" className="h-12 w-full rounded-full text-base shadow-lg shadow-primary/20" asChild>
        <Link href={loginUrl(email)}>
          Continue to login
          <ArrowRightIcon data-icon="inline-end" aria-hidden />
        </Link>
      </Button>
    </div>
  )
}
