import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type StatTone = "leaf" | "harvest" | "soil" | "sky"

const TONES: Record<StatTone, string> = {
  leaf: "bg-primary/15 text-primary",
  harvest: "bg-harvest/25 text-harvest-foreground dark:text-harvest",
  soil: "bg-soil/15 text-soil",
  sky: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "leaf",
}: {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  tone?: StatTone
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-soil/10 bg-card p-4 shadow-sm sm:gap-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</p>
        <span className={cn("flex size-9 shrink-0 items-center sm:size-10 justify-center rounded-[55%_45%_50%_50%/60%_50%_50%_40%]", TONES[tone])}>
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <div>
        <p className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  )
}
