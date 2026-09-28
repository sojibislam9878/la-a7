import { authApi, type AuthSession } from "@/lib/api/auth"
import { useAuthStore } from "@/stores/auth-store"

const LOCK_KEY = "agrostore:refresh-lock"
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
    return
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
    if (readLock() === startedAt) writeLock(null)
  }
}

export function refreshSession(): Promise<AuthSession | null> {
  refreshInFlight ??= runRefresh().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}
