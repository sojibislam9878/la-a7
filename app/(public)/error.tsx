"use client"

import { ErrorState } from "@/components/shared/error-state"

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="px-4">
      <ErrorState error={error} reset={reset} />
    </div>
  )
}
