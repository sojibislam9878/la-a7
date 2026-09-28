import type { Role } from "@/types/user"

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
