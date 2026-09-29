"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { BanIcon, CheckIcon, RotateCcwIcon, XIcon } from "lucide-react"
import { useForm } from "react-hook-form"
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
import { Textarea } from "@/components/ui/textarea"
import { useSetWarehouseStatus } from "@/hooks/use-admin-warehouses"
import type { AdminWarehouse } from "@/types/admin"
import type { WarehouseStatus } from "@/types/warehouse"

export type Decision = "APPROVE" | "REINSTATE" | "REJECT" | "SUSPEND"

const DECISIONS: Record<
  Decision,
  {
    target: WarehouseStatus
    button: string
    icon: typeof CheckIcon
    variant: "default" | "outline" | "destructive"
    title: (name: string) => string
    description: string
    required: boolean
    placeholder: string
    confirm: string
  }
> = {
  APPROVE: {
    target: "APPROVED",
    button: "Approve",
    icon: CheckIcon,
    variant: "default",
    title: (name) => `Approve ${name}?`,
    description: "It goes live on the search page and farmers can book its active chambers straight away.",
    required: false,
    placeholder: "Trade licence and cold-chain certificate verified",
    confirm: "Approve warehouse",
  },
  REINSTATE: {
    target: "APPROVED",
    button: "Reinstate",
    icon: RotateCcwIcon,
    variant: "default",
    title: (name) => `Reinstate ${name}?`,
    description: "It becomes visible to farmers again and can take new bookings.",
    required: false,
    placeholder: "Renewed certificate received",
    confirm: "Reinstate warehouse",
  },
  REJECT: {
    target: "REJECTED",
    button: "Reject",
    icon: XIcon,
    variant: "outline",
    title: (name) => `Reject ${name}?`,
    description: "It stays hidden from farmers. The owner sees the rejection on their dashboard.",
    required: true,
    placeholder: "Licence number doesn't match the trade licence on file",
    confirm: "Reject warehouse",
  },
  SUSPEND: {
    target: "SUSPENDED",
    button: "Suspend",
    icon: BanIcon,
    variant: "outline",
    title: (name) => `Suspend ${name}?`,
    description: "It disappears from search and stops taking new bookings. Lots already stored stay where they are.",
    required: true,
    placeholder: "Cold-chain certificate expired, pending renewal",
    confirm: "Suspend warehouse",
  },
}

function reasonSchema(required: boolean) {
  return z.object({
    reason: z
      .string()
      .trim()
      .max(255, { error: "Keep it under 255 characters" })
      .refine((value) => (required ? value.length >= 3 : value.length === 0 || value.length >= 3), {
        error: required ? "Give a reason of at least 3 characters. It's saved in the audit log." : "Write at least 3 characters, or leave it empty",
      }),
  })
}

type ReasonValues = { reason: string }

export function WarehouseDecisionDialog({ warehouse, decision }: { warehouse: AdminWarehouse; decision: Decision }) {
  const [open, setOpen] = useState(false)
  const setStatus = useSetWarehouseStatus()
  const config = DECISIONS[decision]
  const Icon = config.icon
  const fieldId = `decision-${decision}-${warehouse.id}`
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReasonValues>({ resolver: zodResolver(reasonSchema(config.required)), defaultValues: { reason: "" } })

  const onSubmit = handleSubmit(({ reason }) => {
    setOpen(false)
    setStatus.mutate({ id: warehouse.id, name: warehouse.name, status: config.target, reason: reason || undefined })
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
        <Button size="sm" variant={config.variant} className="rounded-full">
          <Icon data-icon="inline-start" aria-hidden />
          {config.button}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>{config.title(warehouse.name)}</AlertDialogTitle>
            <AlertDialogDescription>{config.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <Field data-invalid={!!errors.reason || undefined}>
            <FieldLabel htmlFor={fieldId}>
              {config.required ? "Reason" : "Note"}{" "}
              {!config.required && <span className="font-normal text-muted-foreground">(optional)</span>}
            </FieldLabel>
            <Textarea
              id={fieldId}
              rows={3}
              placeholder={config.placeholder}
              aria-invalid={!!errors.reason}
              {...register("reason")}
            />
            <FieldDescription>Saved with the decision in the audit log.</FieldDescription>
            <FieldError errors={[errors.reason]} />
          </Field>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <Button type="submit" variant={config.target === "APPROVED" ? "default" : "destructive"}>
              {config.confirm}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export const DECISIONS_FOR: Record<WarehouseStatus, Decision[]> = {
  PENDING: ["APPROVE", "REJECT"],
  APPROVED: ["SUSPEND"],
  SUSPENDED: ["REINSTATE"],
  REJECTED: ["APPROVE"],
}
