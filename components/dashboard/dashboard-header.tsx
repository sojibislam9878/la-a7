"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { GlobeIcon } from "lucide-react"

import { ThemeToggle } from "@/components/layout/theme-toggle"
import { UserMenu } from "@/components/layout/user-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { findDashboardItem } from "@/constants/navigation"
import { ROLE_HOME, ROLE_LABEL } from "@/constants/routes"
import { useAuthStore } from "@/stores/auth-store"
import type { Role } from "@/types/user"

export function DashboardHeader({ role }: { role: Role }) {
  const pathname = usePathname()
  const user = useAuthStore((state) => (state.status === "authenticated" ? state.user : null))
  const current = findDashboardItem(role, pathname)
  const home = ROLE_HOME[role]
  const onHome = pathname === home

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur md:rounded-t-xl">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-4! self-center" />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden sm:block">
            {onHome ? (
              <BreadcrumbPage>{ROLE_LABEL[role]}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link href={home}>{ROLE_LABEL[role]}</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {!onHome && current && (
            <>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{current.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
          <Link href="/">
            <GlobeIcon data-icon="inline-start" aria-hidden />
            Public site
          </Link>
        </Button>
        <ThemeToggle />
        {user ? <UserMenu user={user} /> : <Skeleton className="size-8 rounded-full" aria-hidden />}
      </div>
    </header>
  )
}
