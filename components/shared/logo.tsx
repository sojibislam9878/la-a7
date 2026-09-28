import Link from "next/link"
import { SnowflakeIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function Logo({
  className,
  variant = "default",
}: {
  className?: string
  variant?: "default" | "light"
}) {
  const light = variant === "light"

  return (
    <Link
      href="/"
      aria-label="AgroStore home"
      className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}
    >
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-lg",
          light ? "bg-harvest text-harvest-foreground" : "bg-primary text-primary-foreground"
        )}
      >
        <SnowflakeIcon className="size-4" aria-hidden />
      </span>
      <span className={cn("text-lg", light && "text-forest-foreground")}>
        Agro<span className={light ? "text-harvest" : "text-primary"}>Store</span>
      </span>
    </Link>
  )
}
