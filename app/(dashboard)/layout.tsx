import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { RoleGuard } from "@/components/dashboard/role-guard"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { parseRole, ROLE_COOKIE } from "@/lib/auth/role-cookie"

// Server Component: reads the role hint and the sidebar's persisted open state
// from cookies, so the correct navigation is in the first HTML response.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const role = parseRole(cookieStore.get(ROLE_COOKIE)?.value)

  // proxy.ts normally redirects first; this covers requests it did not match
  if (!role) redirect("/login")

  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar role={role} />
      <SidebarInset className="bg-grain">
        <DashboardHeader role={role} />
        <div className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          <RoleGuard>{children}</RoleGuard>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
