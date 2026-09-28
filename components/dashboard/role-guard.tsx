"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ROLE_HOME } from "@/constants/routes"
import { useAuthStore } from "@/stores/auth-store"

/**
 * Authoritative client-side check. `proxy.ts` only sees the role hint cookie,
 * so this waits for the real session and redirects when it is missing or the
 * role does not own this area.
 */
export function RoleGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const status = useAuthStore((state) => state.status)
  const role = useAuthStore((state) => state.user?.role)

  const home = role ? ROLE_HOME[role] : null
  const allowed = status === "authenticated" && home !== null && (pathname === home || pathname.startsWith(`${home}/`))

  useEffect(() => {
    if (status === "guest") {
      router.replace(`/login?${new URLSearchParams({ redirect: pathname }).toString()}`)
    } else if (status === "authenticated" && home && !allowed) {
      router.replace(home)
    }
  }, [status, home, allowed, pathname, router])

  if (!allowed) return <DashboardSkeleton />
  return children
}
