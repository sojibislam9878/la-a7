"use client"

import { useState } from "react"
import Link from "next/link"
import { LayoutDashboardIcon, LogOutIcon, MenuIcon } from "lucide-react"

import { NavLinks } from "@/components/layout/nav-links"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ROLE_HOME } from "@/constants/routes"
import { useLogout } from "@/hooks/use-logout"
import { useAuthStore } from "@/stores/auth-store"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const user = useAuthStore((state) => (state.status === "authenticated" ? state.user : null))
  const logout = useLogout()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle asChild>
            <div>
              <Logo />
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">Main navigation</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="px-4">
          <NavLinks className="flex-col items-stretch" onNavigate={close} />
        </nav>
        <Separator />
        <div className="flex flex-col gap-2 px-4">
          {user ? (
            <>
              <div className="px-1 pb-1">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button size="lg" asChild>
                <Link href={ROLE_HOME[user.role]} onClick={close}>
                  <LayoutDashboardIcon data-icon="inline-start" aria-hidden />
                  Dashboard
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                disabled={logout.isPending}
                onClick={() => {
                  close()
                  logout.mutate()
                }}
              >
                <LogOutIcon data-icon="inline-start" aria-hidden />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login" onClick={close}>
                  Log in
                </Link>
              </Button>
              <Button size="lg" asChild>
                <Link href="/register" onClick={close}>
                  Get started
                </Link>
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
