import type { Metadata } from "next"

import { Faq } from "@/components/landing/faq"
import { ForOwners } from "@/components/landing/for-owners"
import { PageHero } from "@/components/shared/page-hero"

export const metadata: Metadata = {
  title: "For warehouse owners",
  description:
    "List your cold storage on AgroStore. Reach farmers across Bangladesh, take bookings by the kilogram and get paid through Stripe.",
}

export default function ForOwnersPage() {
  return (
    <>
      <PageHero
        eyebrow="List your warehouse"
        title="Put your empty chambers in front of farmers"
        description="Add your warehouse and chambers, approve the bookings you want, and let AgroStore handle payments and the paperwork."
      />
      <ForOwners />
      <Faq />
    </>
  )
}
