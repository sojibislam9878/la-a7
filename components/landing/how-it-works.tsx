import { CalendarCheckIcon, CreditCardIcon, PackageCheckIcon, SearchIcon } from "lucide-react"

import { SectionHeading } from "@/components/landing/section-heading"

const STEPS = [
  {
    icon: SearchIcon,
    title: "Search & compare",
    description:
      "Filter approved warehouses by district, crop, capacity, price and rating. See real availability for your exact dates.",
  },
  {
    icon: CalendarCheckIcon,
    title: "Book capacity",
    description:
      "Reserve the kilograms you need for a date window. The chamber temperature is checked against your crop automatically.",
  },
  {
    icon: CreditCardIcon,
    title: "Pay securely",
    description:
      "Once the owner approves, pay the storage rent online with Stripe. Your lot is confirmed the moment payment clears.",
  },
  {
    icon: PackageCheckIcon,
    title: "Store & withdraw",
    description:
      "Your produce is quality graded at intake. Request withdrawal any time and settle a fair, recalculated final bill.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y bg-muted/40 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="From harvest to cold storage in four steps"
          description="A booking flow built around how cold storage is actually sold: by kilogram, by date, with approval and inspection."
        />

        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative flex flex-col gap-4 rounded-2xl border bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="size-5" aria-hidden />
                </span>
                <span className="text-4xl font-bold text-muted-foreground/80 dark:text-muted-foreground/60" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-lg font-semibold">
                <span className="sr-only">Step {index + 1}: </span>
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
