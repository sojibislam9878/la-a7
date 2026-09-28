"use client"

import { useState } from "react"
import Link from "next/link"
import { MenuIcon } from "lucide-react"

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

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
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
        </div>
      </SheetContent>
    </Sheet>
  )
}
