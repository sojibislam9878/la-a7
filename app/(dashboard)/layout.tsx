import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { RoleGuard } from "@/components/dashboard/role-guard"
import { MAIN_CONTENT_ID } from "@/components/shared/skip-link"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { parseRole, ROLE_COOKIE } from "@/lib/auth/role-cookie"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const role = parseRole(cookieStore.get(ROLE_COOKIE)?.value)

  if (!role) redirect("/login")

  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar role={role} />
      <SidebarInset id={MAIN_CONTENT_ID} tabIndex={-1} className="min-w-0 bg-grain outline-none">
        <DashboardHeader role={role} />
        <div className="mx-auto w-full min-w-0 max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          <RoleGuard>{children}</RoleGuard>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
