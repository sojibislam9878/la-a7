import Link from "next/link"
import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"

const BENEFITS = [
  "List warehouses and chambers with their own temperature ranges",
  "Set your rate per kg per day and a minimum booking period",
  "Approve or reject booking requests from one queue",
  "Get paid upfront before the produce arrives",
  "Track stored lots, withdrawals and final settlements",
]

export function ForOwners() {
  return (
    <section id="for-owners" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground sm:px-12 lg:grid-cols-2 lg:py-16">
          <div className="flex flex-col items-start gap-5">
            <span className="text-sm font-semibold tracking-wide uppercase opacity-80">For warehouse owners</span>
            <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Fill your chambers before the season starts
            </h2>
            <p className="text-lg text-pretty opacity-90">
              Stop managing capacity by phone and paper ledger. Reach farmers across Bangladesh and let
              AgroStore handle bookings, payments and scheduling.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register?role=WAREHOUSE_OWNER">
                  List your warehouse
                  <ArrowRightIcon data-icon="inline-end" aria-hidden />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                asChild
              >
                <Link href="/login">Owner log in</Link>
              </Button>
            </div>
          </div>

          <ul className="flex flex-col gap-4">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 opacity-90" aria-hidden />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
