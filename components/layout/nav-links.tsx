"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { PUBLIC_NAV_LINKS } from "@/constants/navigation"
import { cn } from "@/lib/utils"

export function isNavLinkActive(pathname: string, href: string) {
  // Section anchors on the landing page are never marked active
  if (href.includes("#")) return false
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function NavLinks({
  className,
  onNavigate,
}: {
  className?: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <ul className={cn("flex items-center gap-1", className)}>
      {PUBLIC_NAV_LINKS.map((link) => {
        const active = isNavLinkActive(pathname, link.href)

        return (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                active && "text-foreground"
              )}
            >
              {link.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
