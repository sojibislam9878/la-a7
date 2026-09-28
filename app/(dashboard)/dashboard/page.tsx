import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { ROLE_HOME } from "@/constants/routes"
import { parseRole, ROLE_COOKIE } from "@/lib/auth/role-cookie"

/** `/dashboard` is a shortcut to the signed-in role's home */
export default async function DashboardRedirectPage() {
  const role = parseRole((await cookies()).get(ROLE_COOKIE)?.value)
  redirect(role ? ROLE_HOME[role] : "/login?redirect=/dashboard")
}
