import {
  ClipboardCheckIcon,
  GaugeIcon,
  LockKeyholeIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  StarIcon,
} from "lucide-react"

import { SectionHeading } from "@/components/landing/section-heading"

const FEATURES = [
  {
    icon: GaugeIcon,
    title: "Real availability, never double booked",
    description:
      "Capacity is calculated from the peak committed load in your date window, and the last kilogram can only be booked once.",
  },
  {
    icon: LockKeyholeIcon,
    title: "Secure online payments",
    description: "Storage rent is paid through Stripe Checkout. Only a verified payment confirms your booking.",
  },
  {
    icon: ClipboardCheckIcon,
    title: "Quality graded at intake",
    description: "Every lot is inspected and graded A, B or C, with the actual weight and moisture on record.",
  },
  {
    icon: ReceiptIcon,
    title: "Fair, transparent billing",
    description:
      "See the estimate before you book. The final bill follows the actual days stored, with the minimum-days floor shown up front.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Verified warehouses only",
    description: "Owners submit a trade license and NID. Our admins approve each warehouse before it goes live.",
  },
  {
    icon: StarIcon,
    title: "Honest reviews",
    description: "Only farmers who completed a booking can review a warehouse, so every rating comes from a real stay.",
  },
]

export function Features() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why AgroStore"
          title="Built for the harvest rush"
          description="Cold storage is scarce at harvest peak. AgroStore makes every kilogram count, for farmers and owners alike."
        />

        <ul className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <feature.icon className="size-5" aria-hidden />
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
