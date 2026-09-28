import {
  BadgeCheckIcon,
  CalendarCheckIcon,
  ClipboardCheckIcon,
  CreditCardIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  SearchIcon,
  SproutIcon,
  StarIcon,
  UserRoundIcon,
  UsersIcon,
  WarehouseIcon,
} from "lucide-react"

import type { Role } from "@/types/user"

export type NavLink = {
  label: string
  href: string
}

export const PUBLIC_NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Find Storage", href: "/warehouses" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "For Owners", href: "/#for-owners" },
]

export type DashboardNavItem = NavLink & {
  icon: LucideIcon
  /** Match only the exact path (for section roots like `/farmer`) */
  exact?: boolean
}

export type DashboardNavGroup = {
  label: string
  items: DashboardNavItem[]
}

/** Sidebar navigation per role; order is display order */
export const DASHBOARD_NAV: Record<Role, DashboardNavGroup[]> = {
  FARMER: [
    {
      label: "Overview",
      items: [
        { label: "Dashboard", href: "/farmer", icon: LayoutDashboardIcon, exact: true },
        { label: "Find storage", href: "/warehouses", icon: SearchIcon },
      ],
    },
    {
      label: "My storage",
      items: [
        { label: "Bookings", href: "/farmer/bookings", icon: CalendarCheckIcon },
        { label: "Payments", href: "/farmer/payments", icon: CreditCardIcon },
        { label: "Reviews", href: "/farmer/reviews", icon: StarIcon },
      ],
    },
    {
      label: "Account",
      items: [{ label: "Profile", href: "/farmer/profile", icon: UserRoundIcon }],
    },
  ],
  WAREHOUSE_OWNER: [
    {
      label: "Overview",
      items: [{ label: "Dashboard", href: "/owner", icon: LayoutDashboardIcon, exact: true }],
    },
    {
      label: "My business",
      items: [
        { label: "Warehouses", href: "/owner/warehouses", icon: WarehouseIcon },
        { label: "Booking requests", href: "/owner/bookings", icon: CalendarCheckIcon },
      ],
    },
    {
      label: "Account",
      items: [
        { label: "Business profile", href: "/owner/onboarding", icon: BadgeCheckIcon },
        { label: "Profile", href: "/owner/profile", icon: UserRoundIcon },
      ],
    },
  ],
  ADMIN: [
    {
      label: "Overview",
      items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboardIcon, exact: true }],
    },
    {
      label: "Operations",
      items: [
        { label: "Warehouses", href: "/admin/warehouses", icon: WarehouseIcon },
        { label: "Bookings", href: "/admin/bookings", icon: CalendarCheckIcon },
        { label: "Inspections", href: "/admin/inspections", icon: ClipboardCheckIcon },
        { label: "Payments", href: "/admin/payments", icon: CreditCardIcon },
      ],
    },
    {
      label: "Platform",
      items: [
        { label: "Users", href: "/admin/users", icon: UsersIcon },
        { label: "Crop types", href: "/admin/crop-types", icon: SproutIcon },
        { label: "Audit logs", href: "/admin/audit-logs", icon: HistoryIcon },
      ],
    },
    {
      label: "Account",
      items: [{ label: "Profile", href: "/admin/profile", icon: UserRoundIcon }],
    },
  ],
}

export function isDashboardItemActive(pathname: string, item: DashboardNavItem) {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

/** Finds the nav item for the current page (longest matching href wins) */
export function findDashboardItem(role: Role, pathname: string) {
  return DASHBOARD_NAV[role]
    .flatMap((group) => group.items)
    .filter((item) => isDashboardItemActive(pathname, item) || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]
}
