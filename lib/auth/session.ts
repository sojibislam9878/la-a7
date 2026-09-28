import { authApi, type AuthSession } from "@/lib/api/auth"
import { useAuthStore } from "@/stores/auth-store"

let refreshInFlight: Promise<AuthSession | null> | null = null

/**
 * Exchanges the refresh cookie for a new session. Concurrent callers share one
 * request: the backend rotates the refresh token, so a second parallel call
 * would present an already-revoked token and log the user out.
 */
export function refreshSession(): Promise<AuthSession | null> {
  refreshInFlight ??= authApi
    .refresh()
    .then(({ data }) => {
      useAuthStore.getState().setSession(data)
      return data
    })
    .catch(() => {
      useAuthStore.getState().clearSession()
      return null
    })
    .finally(() => {
      refreshInFlight = null
    })

  return refreshInFlight
}
