import type { Metadata } from "next"

import { Faq } from "@/components/landing/faq"
import { FinalCta } from "@/components/landing/final-cta"
import { PageHero } from "@/components/shared/page-hero"

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about booking, paying for and storing produce with AgroStore.",
}

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Help"
        title="Frequently asked questions"
        description="Booking, payments, intake inspection and withdrawals, explained."
      />
      <Faq />
      <FinalCta />
    </>
  )
}
