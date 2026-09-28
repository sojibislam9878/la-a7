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
