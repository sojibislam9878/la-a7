import Link from "next/link"
import { ArrowLeftIcon, ClipboardCheckIcon, GaugeIcon, LockKeyholeIcon } from "lucide-react"

import { BookingPreview } from "@/components/auth/booking-preview"
import { FarmScene } from "@/components/auth/farm-scene"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Leaf } from "@/components/shared/leaf"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"

const HIGHLIGHTS = [
  { icon: GaugeIcon, text: "Live capacity" },
  { icon: LockKeyholeIcon, text: "Stripe payments" },
  { icon: ClipboardCheckIcon, text: "Graded intake" },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-svh overflow-hidden bg-cream bg-grain">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 -z-10 size-[28rem] rounded-[42%_58%_63%_37%/45%_40%_60%_55%] bg-harvest/20 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/3 -z-10 size-[30rem] rounded-[58%_42%_38%_62%/52%_60%_40%_48%] bg-primary/15 blur-2xl"
      />

      <div className="grid min-h-svh lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]">
        <aside className="relative m-4 hidden flex-col overflow-hidden rounded-[2.5rem] bg-forest bg-grain text-forest-foreground shadow-2xl shadow-forest/30 lg:flex">
          <div className="relative z-10 flex flex-col gap-10 p-10 xl:p-14">
            <Logo variant="light" />

            <div className="flex flex-col gap-5">
              <h2 className="font-display text-4xl leading-[1.1] font-semibold text-balance xl:text-5xl">
                Grow more.{" "}
                <span className="relative whitespace-nowrap text-harvest">
                  Waste less.
                  <svg
                    viewBox="0 0 200 12"
                    preserveAspectRatio="none"
                    className="absolute -bottom-2 left-0 h-3 w-full text-harvest/70"
                    aria-hidden
                  >
                    <path d="M2 9 C50 2 150 2 198 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
              </h2>
              <p className="max-w-md text-lg text-forest-foreground/80">
                Book cold storage before the harvest rush, not at the gate with a full truck. Reserve
                capacity by the kilogram, for exact dates.
              </p>
            </div>

            <ul className="flex flex-wrap gap-2">
              {HIGHLIGHTS.map((item) => (
                <li
                  key={item.text}
                  className="flex items-center gap-2 rounded-full border border-forest-foreground/15 bg-forest-foreground/10 px-4 py-2 text-sm backdrop-blur"
                >
                  <item.icon className="size-4 text-harvest" aria-hidden />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 hidden min-h-0 flex-1 items-center justify-center px-10 [@media(min-height:900px)]:flex">
            <BookingPreview />
          </div>

          <Leaf className="absolute top-8 right-8 size-16 rotate-12 text-forest-foreground/15" />
          <FarmScene className="mt-auto" />
        </aside>

        <div className="flex flex-col">
          <header className="flex h-16 items-center justify-between px-4 sm:px-8">
            <Logo className="lg:invisible" />
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link href="/">
                  <ArrowLeftIcon data-icon="inline-start" aria-hidden />
                  Back to home
                </Link>
              </Button>
              <ThemeToggle />
            </div>
          </header>

          <main className="flex flex-1 items-center justify-center px-4 pt-4 pb-12 sm:px-8">
            <div className="relative w-full max-w-xl">
              <Leaf className="absolute -top-8 -left-6 size-16 -rotate-12 text-primary/30 sm:-left-10" />
              <Leaf className="absolute -right-5 -bottom-8 size-14 rotate-160 text-harvest/50 sm:-right-8" />
              <div className="relative rounded-[2rem] border border-soil/10 bg-card/90 p-6 shadow-[0_24px_60px_-24px] shadow-soil/25 backdrop-blur sm:p-10">
                {children}
              </div>
            </div>
          </main>

          <div className="overflow-hidden bg-forest lg:hidden" aria-hidden>
            <FarmScene className="h-28 sm:h-36" />
          </div>
        </div>
      </div>
    </div>
  )
}
