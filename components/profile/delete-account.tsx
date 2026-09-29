"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon, Trash2Icon } from "lucide-react"
import { useForm } from "react-hook-form"

import { PasswordInput } from "@/components/auth/password-input"
import { inputClass } from "@/components/profile/account-form"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useDeleteAccount } from "@/hooks/use-profile"
import { ApiError } from "@/lib/api/client"
import { getErrorMessage } from "@/lib/api/form-errors"
import { DELETE_CONFIRMATION, type DeleteAccountValues, deleteAccountSchema } from "@/schemas/profile"

export function DeleteAccount() {
  const [open, setOpen] = useState(false)
  const remove = useDeleteAccount()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<DeleteAccountValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { password: "", confirmation: "" },
  })

  const onSubmit = handleSubmit(({ password }) => {
    remove.mutate(password || undefined, {
      onError: (error) => {
        const passwordProblem = error instanceof ApiError && (error.status === 401 || error.status === 400)
        setError(passwordProblem ? "password" : "root", { type: "server", message: getErrorMessage(error) })
      },
    })
  })

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <p className="font-semibold">Delete account</p>
        <p className="text-sm text-muted-foreground">
          You&apos;ll be logged out and won&apos;t be able to sign in again. Your past bookings and payments stay on record
          for the warehouses you used.
        </p>
      </div>
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (remove.isPending) return
          setOpen(next)
          if (!next) reset()
        }}
      >
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="shrink-0 rounded-full">
            <Trash2Icon data-icon="inline-start" aria-hidden />
            Delete account
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your AgroStore account?</AlertDialogTitle>
              <AlertDialogDescription>
                This can&apos;t be undone from your side. Make sure no lots are still in storage before you go.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Field data-invalid={!!errors.password || undefined}>
              <FieldLabel htmlFor="delete-password">Password</FieldLabel>
              <PasswordInput
                id="delete-password"
                autoComplete="current-password"
                className={inputClass}
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <FieldDescription>Leave empty if you signed up with Google.</FieldDescription>
              <FieldError errors={[errors.password]} />
            </Field>

            <Field data-invalid={!!errors.confirmation || undefined}>
              <FieldLabel htmlFor="delete-confirmation">
                Type <span className="font-mono font-semibold">{DELETE_CONFIRMATION}</span> to confirm
              </FieldLabel>
              <Input
                id="delete-confirmation"
                autoComplete="off"
                spellCheck={false}
                className={inputClass}
                aria-invalid={!!errors.confirmation}
                {...register("confirmation")}
              />
              <FieldError errors={[errors.confirmation]} />
            </Field>

            {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={remove.isPending}>
                Keep my account
              </AlertDialogCancel>
              <Button type="submit" variant="destructive" disabled={remove.isPending}>
                {remove.isPending && <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />}
                Delete forever
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
