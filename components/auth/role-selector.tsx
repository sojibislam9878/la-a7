"use client"

import { CheckIcon, SproutIcon, WarehouseIcon } from "lucide-react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import type { SelfServiceRole } from "@/types/user"

const ROLE_OPTIONS = [
  {
    value: "FARMER",
    title: "I'm a farmer",
    description: "Find and book cold storage for my harvest",
    icon: SproutIcon,
    blob: "rounded-[62%_38%_46%_54%/60%_44%_56%_40%] bg-primary/15 text-primary",
  },
  {
    value: "WAREHOUSE_OWNER",
    title: "I own a warehouse",
    description: "List my cold storage and take bookings",
    icon: WarehouseIcon,
    blob: "rounded-[40%_60%_58%_42%/50%_58%_42%_50%] bg-harvest/25 text-harvest-foreground dark:text-harvest",
  },
] as const satisfies ReadonlyArray<{ value: SelfServiceRole } & Record<string, unknown>>

export function RoleSelector({
  value,
  onChange,
  invalid,
}: {
  value: SelfServiceRole
  onChange: (role: SelfServiceRole) => void
  invalid?: boolean
}) {
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={(next) => onChange(next as SelfServiceRole)}
      aria-invalid={invalid}
      className="grid gap-3 sm:grid-cols-2"
    >
      {ROLE_OPTIONS.map((option) => (
        <RadioGroupPrimitive.Item
          key={option.value}
          value={option.value}
          className={cn(
            "group relative flex items-start gap-3 rounded-2xl border-2 border-soil/10 bg-cream/60 p-4 text-left transition-all outline-none",
            "hover:border-primary/40 hover:bg-cream",
            "focus-visible:ring-3 focus-visible:ring-ring/50",
            "data-checked:border-primary data-checked:bg-primary/5 data-checked:shadow-md data-checked:shadow-primary/10",
            invalid && "border-destructive/50"
          )}
        >
          <span className={cn("flex size-11 shrink-0 items-center justify-center", option.blob)}>
            <option.icon className="size-5" aria-hidden />
          </span>
          <span className="flex flex-col gap-0.5 pr-6">
            <span className="font-semibold">{option.title}</span>
            <span className="text-xs text-muted-foreground">{option.description}</span>
          </span>
          <span
            className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full border-2 border-soil/20 transition-colors group-data-[state=checked]:border-primary group-data-[state=checked]:bg-primary"
            aria-hidden
          >
            <CheckIcon className="size-3 text-primary-foreground opacity-0 transition-opacity group-data-[state=checked]:opacity-100" />
          </span>
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  )
}
