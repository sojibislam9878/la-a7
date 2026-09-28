import type { FieldValues, Path, UseFormSetError } from "react-hook-form"

import { ApiError } from "@/lib/api/client"

export function applyServerFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[]
) {
  if (!(error instanceof ApiError)) return false

  let applied = false
  for (const fieldError of error.fieldErrors) {
    const field = fields.find((name) => name === fieldError.path)
    if (field) {
      setError(field, { type: "server", message: fieldError.message }, { shouldFocus: !applied })
      applied = true
    }
  }
  return applied
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof Error && error.message) return error.message
  return fallback
}
