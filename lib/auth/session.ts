import { authApi, type AuthSession } from "@/lib/api/auth"
import { useAuthStore } from "@/stores/auth-store"

/*
 * The backend rotates the refresh token on every use and revokes the old one,
 * so two refreshes with the same cookie can never both succeed. That can
 * happen in two ways, and each needs its own guard:
 *  - several callers in one page at once: share a single in-flight promise;
 *  - overlapping page loads or tabs (a fast reload while a refresh is still
 *    running): a cross-tab lock in localStorage makes the newer page wait. The
 *    older request keeps running (`keepalive`) and stores the rotated cookie,
 *    which the waiting page then uses.
 */
const LOCK_KEY = "agrostore:refresh-lock"
/** Upper bound for a refresh round trip; an older lock is treated as stale */
const LOCK_WINDOW_MS = 5000

let refreshInFlight: Promise<AuthSession | null> | null = null

function readLock() {
  try {
    const value = localStorage.getItem(LOCK_KEY)
    return value ? Number(value) : null
  } catch {
    return null
  }
}

function writeLock(value: number | null) {
  try {
    if (value === null) localStorage.removeItem(LOCK_KEY)
    else localStorage.setItem(LOCK_KEY, String(value))
  } catch {
    // Storage unavailable: fall back to the in-page guard only
  }
}

async function waitForOtherRefresh() {
  for (;;) {
    const startedAt = readLock()
    if (startedAt === null) return
    const age = Date.now() - startedAt
    if (age < 0 || age >= LOCK_WINDOW_MS) return
    await new Promise((resolve) => setTimeout(resolve, Math.min(150, LOCK_WINDOW_MS - age)))
  }
}

async function runRefresh(): Promise<AuthSession | null> {
  await waitForOtherRefresh()
  const startedAt = Date.now()
  writeLock(startedAt)

  try {
    const { data } = await authApi.refresh()
    useAuthStore.getState().setSession(data)
    return data
  } catch {
    useAuthStore.getState().clearSession()
    return null
  } finally {
    // Only release our own lock, never a newer one from another tab
    if (readLock() === startedAt) writeLock(null)
  }
}

/** Exchanges the refresh cookie for a new session (see the note above) */
export function refreshSession(): Promise<AuthSession | null> {
  refreshInFlight ??= runRefresh().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}
