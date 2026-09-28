"use client"

import { ErrorState } from "@/components/shared/error-state"

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-cream bg-grain px-4">
      <ErrorState error={error} reset={reset} />
    </main>
  )
}
