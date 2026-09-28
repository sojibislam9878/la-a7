import type { LucideIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export const authInputClass =
  "h-11 rounded-xl border-soil/15 bg-cream/60 px-3.5 text-base shadow-none transition-colors hover:border-soil/30 focus-visible:bg-card md:text-sm dark:bg-input/20"

/** Taller, softer input for the auth pages, with an optional leading icon */
export function AuthInput({
  icon: Icon,
  className,
  ...props
}: React.ComponentProps<"input"> & { icon?: LucideIcon }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      )}
      <Input className={cn(authInputClass, Icon && "pl-10", className)} {...props} />
    </div>
  )
}
