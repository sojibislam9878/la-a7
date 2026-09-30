"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { InfoIcon, KeyRoundIcon, Loader2Icon } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"

import { PasswordChecklist } from "@/components/auth/password-checklist"
import { PasswordInput } from "@/components/auth/password-input"
import { inputClass } from "@/components/profile/account-form"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { useSavePassword } from "@/hooks/use-profile"
import { ApiError } from "@/lib/api/client"
import { getErrorMessage } from "@/lib/api/form-errors"
import { type PasswordFormValues, passwordFormSchema } from "@/schemas/profile"

export function PasswordForm() {
  const [hasPassword, setHasPassword] = useState(true)
  return <PasswordFields key={String(hasPassword)} hasPassword={hasPassword} onNoPassword={() => setHasPassword(false)} />
}

function PasswordFields({ hasPassword, onNoPassword }: { hasPassword: boolean; onNoPassword: () => void }) {
  const save = useSavePassword()
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema(hasPassword)),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })
  const newPassword = useWatch({ control, name: "newPassword" })

  const onSubmit = handleSubmit((values) => {
    save.mutate(
      { currentPassword: hasPassword ? values.currentPassword : undefined, newPassword: values.newPassword },
      {
        onSuccess: () => reset(),
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409 && hasPassword) {
            onNoPassword()
            return
          }
          const field =
            error instanceof ApiError && error.status === 401
              ? "currentPassword"
              : error instanceof ApiError && error.status === 400
                ? "newPassword"
                : "root"
          setError(field, { type: "server", message: getErrorMessage(error) })
        },
      }
    )
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {!hasPassword && (
        <p className="flex items-start gap-2 rounded-2xl bg-sky-500/10 p-3 text-sm text-sky-700 dark:text-sky-300">
          <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          This account signs in with Google and has no password yet. Set one to also log in with your email.
        </p>
      )}

      {hasPassword && (
        <Field data-invalid={!!errors.currentPassword || undefined} className="sm:max-w-sm">
          <FieldLabel htmlFor="current-password">Current password</FieldLabel>
          <PasswordInput
            id="current-password"
            autoComplete="current-password"
            className={inputClass}
            aria-invalid={!!errors.currentPassword}
            {...register("currentPassword")}
          />
          <FieldError errors={[errors.currentPassword]} />
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.newPassword || undefined}>
          <FieldLabel htmlFor="new-password">New password</FieldLabel>
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            className={inputClass}
            aria-invalid={!!errors.newPassword}
            aria-describedby="new-password-rules"
            {...register("newPassword")}
          />
          <FieldError errors={[errors.newPassword]} />
        </Field>
        <Field data-invalid={!!errors.confirmPassword || undefined}>
          <FieldLabel htmlFor="confirm-new-password">Confirm new password</FieldLabel>
          <PasswordInput
            id="confirm-new-password"
            autoComplete="new-password"
            className={inputClass}
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>
      </div>
      <PasswordChecklist id="new-password-rules" value={newPassword} />

      <FieldError errors={[errors.root]} />

      <div className="flex justify-end">
        <Button type="submit" className="rounded-full" disabled={save.isPending}>
          {save.isPending ? (
            <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />
          ) : (
            <KeyRoundIcon data-icon="inline-start" aria-hidden />
          )}
          {hasPassword ? "Change password" : "Set password"}
        </Button>
      </div>
    </form>
  )
}
