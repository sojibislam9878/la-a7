"use client"

import Link from "next/link"
import { LayoutDashboardIcon } from "lucide-react"

import { UserMenu } from "@/components/layout/user-menu"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ROLE_HOME } from "@/constants/routes"
import { useAuthStore } from "@/stores/auth-store"

/** Public navbar actions: guest buttons, or dashboard link + account menu */
export function NavAuthActions() {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)

  // Session is still being restored (also the server-rendered state)
  if (status === "loading") {
    return <Skeleton className="hidden h-8 w-40 rounded-lg sm:block" aria-hidden />
  }

  if (status === "authenticated" && user) {
    return (
      <>
        <Button variant="outline" asChild className="hidden sm:inline-flex">
          <Link href={ROLE_HOME[user.role]}>
            <LayoutDashboardIcon data-icon="inline-start" aria-hidden />
            Dashboard
          </Link>
        </Button>
        <UserMenu user={user} />
      </>
    )
  }

  return (
    <>
      <Button variant="ghost" asChild className="hidden sm:inline-flex">
        <Link href="/login">Log in</Link>
      </Button>
      <Button asChild className="hidden sm:inline-flex">
        <Link href="/register">Get started</Link>
      </Button>
    </>
  )
}
