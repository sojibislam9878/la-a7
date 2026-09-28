import type { Role } from "@/types/user"

/**
 * Readable hint cookie for `proxy.ts` route guarding. It carries no secret: the
 * access token stays in memory and the backend authorizes every request.
 */
export const ROLE_COOKIE = "agro_role"

const MAX_AGE_SECONDS = 7 * 24 * 60 * 60 // matches the refresh token lifetime

export function setRoleCookie(role: Role) {
  document.cookie = `${ROLE_COOKIE}=${role}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax`
}

export function clearRoleCookie() {
  document.cookie = `${ROLE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
}

export function hasRoleCookie() {
  return document.cookie.split("; ").some((part) => part.startsWith(`${ROLE_COOKIE}=`))
}
