import { useReducer, useSyncExternalStore } from "react"

export const OTP_COOLDOWN_SECONDS = 60

const storageKey = (email: string) => `agrostore:otp-sent:${email.toLowerCase()}`

function readSentAt(email: string) {
  try {
    const value = sessionStorage.getItem(storageKey(email))
    return value ? Number(value) : null
  } catch {
    return null
  }
}

export function markOtpSent(email: string, at = Date.now()) {
  try {
    sessionStorage.setItem(storageKey(email), String(at))
  } catch {
    return
  }
}

const subscribeClock = (tick: () => void) => {
  const id = setInterval(tick, 1000)
  return () => clearInterval(id)
}
const subscribeNever = () => () => {}

export function useOtpCooldown(email: string | null) {
  const nowSec = useSyncExternalStore(subscribeClock, () => Math.floor(Date.now() / 1000), () => 0)
  const sentAt = useSyncExternalStore(
    subscribeNever,
    () => (email ? readSentAt(email) : null),
    () => null
  )
  const [, rerender] = useReducer((n: number) => n + 1, 0)

  const secondsLeft =
    sentAt && nowSec ? Math.max(0, Math.ceil(sentAt / 1000 + OTP_COOLDOWN_SECONDS - nowSec)) : 0

  function start(seconds = OTP_COOLDOWN_SECONDS) {
    if (!email) return
    markOtpSent(email, Date.now() - (OTP_COOLDOWN_SECONDS - seconds) * 1000)
    rerender()
  }

  return { secondsLeft, start }
}
