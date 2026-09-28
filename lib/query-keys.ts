/** Central TanStack Query keys, so invalidation stays consistent */
export const queryKeys = {
  me: ["users", "me"] as const,
  dashboard: ["users", "me", "dashboard"] as const,
}
