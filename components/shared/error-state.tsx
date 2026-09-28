"use client"

import Link from "next/link"
import { HomeIcon, RotateCwIcon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ErrorState({
  error,
  reset,
  homeHref = "/",
  homeLabel = "Go home",
}: {
  error: Error & { digest?: string }
  reset: () => void
  homeHref?: string
  homeLabel?: string
}) {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-[58%_42%_52%_48%/55%_48%_52%_45%] bg-destructive/10 text-destructive">
        <TriangleAlertIcon className="size-7" aria-hidden />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-2xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
        {error.digest && <p className="text-xs text-muted-foreground">Reference: {error.digest}</p>}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={reset} className="rounded-full">
          <RotateCwIcon data-icon="inline-start" aria-hidden />
          Try again
        </Button>
        <Button variant="outline" className="rounded-full" asChild>
          <Link href={homeHref}>
            <HomeIcon data-icon="inline-start" aria-hidden />
            {homeLabel}
          </Link>
        </Button>
      </div>
    </div>
  )
}
