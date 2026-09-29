"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { isOwnerUngatedPath, needsOnboarding, OWNER_ONBOARDING_PATH, ROLE_HOME } from "@/constants/routes"
import { useAuthStore } from "@/stores/auth-store"

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const status = useAuthStore((state) => state.status)
  const role = useAuthStore((state) => state.user?.role)
  const onboarding = useAuthStore((state) => needsOnboarding(state.user))
  const signedOut = useAuthStore((state) => state.signedOut)

  const home = role ? ROLE_HOME[role] : null
  const inRoleArea = status === "authenticated" && home !== null && (pathname === home || pathname.startsWith(`${home}/`))
  const gated = inRoleArea && onboarding && !isOwnerUngatedPath(pathname)
  const allowed = inRoleArea && !gated

  useEffect(() => {
    if (status === "guest" && !signedOut) {
      router.replace(`/login?${new URLSearchParams({ redirect: pathname }).toString()}`)
    } else if (gated) {
      router.replace(OWNER_ONBOARDING_PATH)
    } else if (status === "authenticated" && home && !inRoleArea) {
      router.replace(home)
    }
  }, [status, signedOut, gated, home, inRoleArea, pathname, router])

  if (!allowed) return <DashboardSkeleton />
  return children
}
