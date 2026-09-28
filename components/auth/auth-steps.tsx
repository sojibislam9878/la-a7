import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const STEPS = ["Create account", "Verify email"] as const

export function AuthSteps({ current }: { current: 1 | 2 }) {
  return (
    <ol className="flex items-center gap-3 text-xs font-medium" aria-label="Sign up progress">
      {STEPS.map((label, index) => {
        const step = index + 1
        const done = step < current
        const active = step === current

        return (
          <li key={label} className="flex items-center gap-3" aria-current={active ? "step" : undefined}>
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border text-[11px] transition-colors",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-primary/10 text-primary",
                  !done && !active && "border-soil/20 text-muted-foreground"
                )}
              >
                {done ? <CheckIcon className="size-3.5" aria-hidden /> : step}
              </span>
              <span className={active || done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
            </span>
            {step < STEPS.length && <span className="h-px w-8 bg-soil/20" aria-hidden />}
          </li>
        )
      })}
    </ol>
  )
}
