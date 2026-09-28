import { CheckIcon, XIcon } from "lucide-react"

import { PASSWORD_RULES } from "@/schemas/auth"
import { cn } from "@/lib/utils"

export function PasswordChecklist({ value, id }: { value: string; id?: string }) {
  return (
    <ul id={id} className="grid gap-1 text-xs sm:grid-cols-3" aria-label="Password requirements">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(value)
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-1.5 transition-colors",
              passed ? "text-primary" : "text-muted-foreground"
            )}
          >
            {passed ? <CheckIcon className="size-3.5" aria-hidden /> : <XIcon className="size-3.5" aria-hidden />}
            {rule.label}
            <span className="sr-only">{passed ? "(met)" : "(not met)"}</span>
          </li>
        )
      })}
    </ul>
  )
}
