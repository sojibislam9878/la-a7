"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOutIcon, SnowflakeIcon } from "lucide-react"

import { Leaf } from "@/components/shared/leaf"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { DASHBOARD_NAV, isDashboardItemActive } from "@/constants/navigation"
import { ROLE_LABEL } from "@/constants/routes"
import { useLogout } from "@/hooks/use-logout"
import type { Role } from "@/types/user"

export function AppSidebar({ role }: { role: Role }) {
  const pathname = usePathname()
  const logout = useLogout()
  const { isMobile, setOpenMobile } = useSidebar()
  const closeOnMobile = () => isMobile && setOpenMobile(false)

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="AgroStore home">
              <Link href="/" onClick={closeOnMobile}>
                <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <SnowflakeIcon className="size-4" aria-hidden />
                </span>
                <span className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">
                    Agro<span className="text-primary">Store</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{ROLE_LABEL[role]} workspace</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {DASHBOARD_NAV[role].map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isDashboardItemActive(pathname, item)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                        <Link href={item.href} aria-current={active ? "page" : undefined} onClick={closeOnMobile}>
                          <item.icon aria-hidden />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        {/* Decorative card, hidden when the sidebar collapses to icons */}
        <div className="relative overflow-hidden rounded-xl bg-forest p-3 text-forest-foreground group-data-[collapsible=icon]:hidden">
          <Leaf className="absolute -right-2 -bottom-3 size-14 rotate-12 text-forest-foreground/15" />
          <p className="text-sm font-semibold">Harvest season?</p>
          <p className="mt-0.5 text-xs text-forest-foreground/75">Book capacity early, chambers fill up fast.</p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Log out" onClick={() => logout.mutate()} disabled={logout.isPending}>
              <LogOutIcon aria-hidden />
              <span>{logout.isPending ? "Logging out..." : "Log out"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
