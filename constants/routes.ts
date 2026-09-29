import type { Role, User } from "@/types/user"

export const ROLE_HOME: Record<Role, string> = {
  FARMER: "/farmer",
  WAREHOUSE_OWNER: "/owner",
  ADMIN: "/admin",
}

export const ROLE_LABEL: Record<Role, string> = {
  FARMER: "Farmer",
  WAREHOUSE_OWNER: "Warehouse owner",
  ADMIN: "Admin",
}

export function safeRedirect(value: string | string[] | null | undefined) {
  const path = Array.isArray(value) ? value[0] : value
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return null
  return path
}

export const OWNER_ONBOARDING_PATH = "/owner/onboarding"

const OWNER_UNGATED_PATHS = [OWNER_ONBOARDING_PATH, "/owner/profile"]

export function needsOnboarding(user: Pick<User, "role" | "profileComplete"> | null | undefined) {
  return user?.role === "WAREHOUSE_OWNER" && !user.profileComplete
}

export function isOwnerUngatedPath(pathname: string) {
  return OWNER_UNGATED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}
