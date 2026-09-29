"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { BanIcon, ShieldCheckIcon, UserCogIcon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ROLE_LABEL } from "@/constants/routes"
import { useSetUserRole, useSetUserStatus } from "@/hooks/use-admin-users"
import type { AdminUserDetail } from "@/types/admin"
import type { Role } from "@/types/user"

const reason = (required: boolean) =>
  z
    .string()
    .trim()
    .max(255, { error: "Keep it under 255 characters" })
    .refine((value) => (required ? value.length >= 3 : value.length === 0 || value.length >= 3), {
      error: required ? "Give a reason of at least 3 characters. It's saved in the audit log." : "Write at least 3 characters, or leave it empty",
    })

export function lockReason(user: AdminUserDetail, selfId: string | undefined) {
  if (user.id === selfId) return "This is your own account. Another admin has to change it."
  if (user.role === "ADMIN") return "Admin accounts can't be changed from here."
  if (user.deletedAt) return "This account was deleted by its owner."
  return null
}

export function BanDialog({ user }: { user: AdminUserDetail }) {
  const [open, setOpen] = useState(false)
  const setStatus = useSetUserStatus()
  const banning = user.status === "ACTIVE"
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ reason: string }>({
    resolver: zodResolver(z.object({ reason: reason(banning) })),
    defaultValues: { reason: "" },
  })

  const onSubmit = handleSubmit((values) => {
    setOpen(false)
    setStatus.mutate({ id: user.id, name: user.name, status: banning ? "BANNED" : "ACTIVE", reason: values.reason || undefined })
    reset()
  })

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant={banning ? "destructive" : "default"} className="rounded-full" disabled={setStatus.isPending}>
          {banning ? <BanIcon data-icon="inline-start" aria-hidden /> : <ShieldCheckIcon data-icon="inline-start" aria-hidden />}
          {banning ? "Ban account" : "Unban account"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>{banning ? `Ban ${user.name}?` : `Unban ${user.name}?`}</AlertDialogTitle>
            <AlertDialogDescription>
              {banning
                ? "They're signed out straight away and can't log in or book until an admin unbans them. Their bookings and warehouses stay as they are."
                : "They can sign in and use AgroStore again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Field data-invalid={!!errors.reason || undefined}>
            <FieldLabel htmlFor={`ban-${user.id}`}>
              {banning ? "Reason" : "Note"}{" "}
              {!banning && <span className="font-normal text-muted-foreground">(optional)</span>}
            </FieldLabel>
            <Textarea
              id={`ban-${user.id}`}
              rows={3}
              placeholder={banning ? "Repeated fake booking requests" : "Appeal accepted"}
              aria-invalid={!!errors.reason}
              {...register("reason")}
            />
            <FieldDescription>Saved in the audit log.</FieldDescription>
            <FieldError errors={[errors.reason]} />
          </Field>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <Button type="submit" variant={banning ? "destructive" : "default"}>
              {banning ? "Ban account" : "Unban account"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const ROLE_OPTIONS: Role[] = ["FARMER", "WAREHOUSE_OWNER", "ADMIN"]

export function RoleDialog({ user }: { user: AdminUserDetail }) {
  const [open, setOpen] = useState(false)
  const setRole = useSetUserRole()
  const others = ROLE_OPTIONS.filter((role) => role !== user.role)
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ role: string; reason: string }>({
    resolver: zodResolver(
      z.object({
        role: z.string().refine((value): boolean => (others as string[]).includes(value), { error: "Choose the new role" }),
        reason: reason(false),
      })
    ),
    defaultValues: { role: "", reason: "" },
  })
  const blocker =
    user.role === "WAREHOUSE_OWNER" && user.counts.warehouses > 0
      ? `Owns ${user.counts.warehouses} warehouse(s). The backend refuses a role change until they're deleted.`
      : null

  const onSubmit = handleSubmit((values) => {
    setOpen(false)
    setRole.mutate({ id: user.id, name: user.name, role: values.role as Role, reason: values.reason || undefined })
    reset()
  })

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="rounded-full" disabled={setRole.isPending}>
          <UserCogIcon data-icon="inline-start" aria-hidden />
          Change role
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Change {user.name}&apos;s role</AlertDialogTitle>
            <AlertDialogDescription>
              Currently a {ROLE_LABEL[user.role].toLowerCase()}. The new role changes which workspace they see. Farmers
              with active bookings can&apos;t be moved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {blocker && (
            <p className="rounded-xl bg-harvest/15 px-3 py-2 text-sm text-harvest-foreground dark:text-harvest">{blocker}</p>
          )}
          <Field data-invalid={!!errors.role || undefined}>
            <FieldLabel htmlFor={`role-${user.id}`}>New role</FieldLabel>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange} name={field.name}>
                  <SelectTrigger
                    id={`role-${user.id}`}
                    aria-invalid={!!errors.role}
                    className="h-10! w-full rounded-xl border-soil/15 bg-card text-left *:data-[slot=select-value]:grow"
                  >
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {others.map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABEL[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.role]} />
          </Field>
          <Field data-invalid={!!errors.reason || undefined}>
            <FieldLabel htmlFor={`role-reason-${user.id}`}>
              Reason <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Textarea
              id={`role-reason-${user.id}`}
              rows={2}
              placeholder="Signed up with the wrong account type"
              aria-invalid={!!errors.reason}
              {...register("reason")}
            />
            <FieldError errors={[errors.reason]} />
          </Field>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <Button type="submit">Change role</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
