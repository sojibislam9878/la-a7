import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/**
 * `false` during SSR and hydration, `true` once running on the client.
 * Use it to defer UI whose markup depends on browser-only state
 * (localStorage theme, matchMedia) so it cannot cause a hydration mismatch.
 */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
