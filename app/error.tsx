"use client"

import { ErrorState } from "@/components/shared/error-state"
import { MAIN_CONTENT_ID } from "@/components/shared/skip-link"

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex min-h-svh items-center justify-center bg-cream bg-grain px-4 outline-none">
      <ErrorState error={error} reset={reset} />
    </main>
  )
}
