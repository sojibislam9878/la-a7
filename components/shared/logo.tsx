import Link from "next/link"
import { SnowflakeIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="AgroStore home"
      className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <SnowflakeIcon className="size-4" aria-hidden />
      </span>
      <span className="text-lg">
        Agro<span className="text-primary">Store</span>
      </span>
    </Link>
  )
}
