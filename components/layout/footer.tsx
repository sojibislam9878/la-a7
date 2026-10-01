import Link from "next/link"
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"

import { Logo } from "@/components/shared/logo"
import { Separator } from "@/components/ui/separator"

const FOOTER_SECTIONS = [
  {
    title: "Platform",
    links: [
      { label: "Find storage", href: "/warehouses" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Crop guide", href: "/crop-guide" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "For farmers",
    links: [
      { label: "Create account", href: "/register?role=FARMER" },
      { label: "Log in", href: "/login" },
      { label: "My bookings", href: "/farmer/bookings" },
    ],
  },
  {
    title: "For owners",
    links: [
      { label: "List your warehouse", href: "/register?role=WAREHOUSE_OWNER" },
      { label: "Why list with us", href: "/for-owners" },
      { label: "Owner dashboard", href: "/owner" },
    ],
  },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="col-span-2 flex flex-col gap-4 sm:col-span-3 lg:col-span-1">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              The booking and settlement layer for cold storage in Bangladesh. Reserve capacity by the
              kilogram, for exact dates.
            </p>
            <address className="flex flex-col gap-2 text-sm text-muted-foreground not-italic">
              <span className="flex items-center gap-2">
                <MapPinIcon className="size-4 shrink-0" aria-hidden />
                Station Road, Rangpur, Bangladesh
              </span>
              <span className="flex items-center gap-2">
                <MailIcon className="size-4 shrink-0" aria-hidden />
                support@agrostore.com
              </span>
              <span className="flex items-center gap-2">
                <PhoneIcon className="size-4 shrink-0" aria-hidden />
                +880 1700-000000
              </span>
            </address>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <nav key={section.title} aria-label={section.title} className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold">{section.title}</h2>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} AgroStore. All rights reserved.</p>
          <p>Payments processed securely by Stripe.</p>
        </div>
      </div>
    </footer>
  )
}
