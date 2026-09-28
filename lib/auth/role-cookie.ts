import type { Role } from "@/types/user"

export const ROLE_COOKIE = "agro_role"

const MAX_AGE_SECONDS = 7 * 24 * 60 * 60

export function setRoleCookie(role: Role) {
  document.cookie = `${ROLE_COOKIE}=${role}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax`
}

export function clearRoleCookie() {
  document.cookie = `${ROLE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
}

export function hasRoleCookie() {
  return document.cookie.split("; ").some((part) => part.startsWith(`${ROLE_COOKIE}=`))
}

export function parseRole(value: string | undefined | null): Role | null {
  return value === "FARMER" || value === "WAREHOUSE_OWNER" || value === "ADMIN" ? value : null
}
