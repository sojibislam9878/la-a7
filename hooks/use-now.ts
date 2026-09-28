import { useSyncExternalStore } from "react"

const listeners = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | undefined
let now = Date.now()

function tick() {
  now = Date.now()
  listeners.forEach((notify) => notify())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!timer) {
    timer = setInterval(tick, 1000)
    queueMicrotask(tick)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && timer) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

export function useNow() {
  return useSyncExternalStore(
    subscribe,
    () => now,
    () => 0
  )
}
