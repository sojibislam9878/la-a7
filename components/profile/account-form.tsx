"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon, LockIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useUpdateAccount } from "@/hooks/use-profile"
import { applyServerFieldErrors, getErrorMessage } from "@/lib/api/form-errors"
import type { UpdateMePayload } from "@/lib/api/users"
import { type AccountValues, createAccountSchema } from "@/schemas/profile"
import type { User } from "@/types/user"

const PHONE_HINT: Record<User["role"], string> = {
  FARMER: "Warehouse owners use it to reach you about your lots.",
  WAREHOUSE_OWNER: "Farmers and admins use it to reach you about bookings.",
  ADMIN: "Other admins use it to reach you about platform issues.",
}

export const inputClass = "h-10 rounded-xl border-soil/15 bg-card"

export function AccountForm({ user }: { user: User }) {
  const update = useUpdateAccount()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<AccountValues>({
    resolver: zodResolver(createAccountSchema({ phoneLocked: !!user.phone })),
    defaultValues: { name: user.name, phone: user.phone ?? "" },
  })

  const onSubmit = handleSubmit((values) => {
    const payload: UpdateMePayload = {}
    if (values.name !== user.name) payload.name = values.name
    if (values.phone && values.phone !== (user.phone ?? "")) payload.phone = values.phone
    if (Object.keys(payload).length === 0) {
      reset(values)
      return
    }
    update.mutate(payload, {
      onSuccess: (saved) => reset({ name: saved.name, phone: saved.phone ?? "" }),
      onError: (error) => {
        if (applyServerFieldErrors(error, setError, ["name", "phone"])) return
        toast.error("Couldn't save your details", { description: getErrorMessage(error) })
      },
    })
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <FieldGroup className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.name || undefined}>
          <FieldLabel htmlFor="account-name">Full name</FieldLabel>
          <Input
            id="account-name"
            autoComplete="name"
            className={inputClass}
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={!!errors.phone || undefined}>
          <FieldLabel htmlFor="account-phone">
            Phone {!user.phone && <span className="font-normal text-muted-foreground">(optional)</span>}
          </FieldLabel>
          <Input
            id="account-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="01712345678"
            className={inputClass}
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
          <FieldDescription>{PHONE_HINT[user.role]}</FieldDescription>
          <FieldError errors={[errors.phone]} />
        </Field>

        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="account-email">Email</FieldLabel>
          <div className="relative">
            <Input id="account-email" value={user.email} readOnly className={`${inputClass} pr-10 text-muted-foreground`} />
            <LockIcon className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          </div>
          <FieldDescription>Your email is your login and can&apos;t be changed.</FieldDescription>
        </Field>
      </FieldGroup>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" className="rounded-full" disabled={!isDirty || update.isPending}>
          {update.isPending && <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />}
          Save changes
        </Button>
        {isDirty && !update.isPending && (
          <Button type="button" variant="ghost" className="rounded-full" onClick={() => reset()}>
            Discard
          </Button>
        )}
      </div>
    </form>
  )
}
