import { MobileNav } from "@/components/layout/mobile-nav"
import { NavAuthActions } from "@/components/layout/nav-auth-actions"
import { NavLinks } from "@/components/layout/nav-links"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Logo } from "@/components/shared/logo"

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1">
          <MobileNav />
          <Logo />
        </div>

        <nav aria-label="Main" className="mx-auto hidden md:block">
          <NavLinks />
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <ThemeToggle />
          <NavAuthActions />
        </div>
      </div>
    </header>
  )
}
