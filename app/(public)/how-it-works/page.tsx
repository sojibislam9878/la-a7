import type { Metadata } from "next"

import { Features } from "@/components/landing/features"
import { FinalCta } from "@/components/landing/final-cta"
import { HowItWorks } from "@/components/landing/how-it-works"
import { PageHero } from "@/components/shared/page-hero"

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Search approved cold storage, book capacity by the kilogram, pay online with Stripe, and get your produce graded at intake.",
}

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="Book cold storage the way it is actually sold"
        description="By the kilogram, for exact dates, with the owner's approval and a quality check when your lot arrives."
      />
      <HowItWorks />
      <Features />
      <FinalCta />
    </>
  )
}
