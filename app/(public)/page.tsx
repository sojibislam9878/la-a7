import { Suspense } from "react"

import { CropGuide } from "@/components/landing/crop-guide"
import { Faq } from "@/components/landing/faq"
import {
  FeaturedWarehouses,
  FeaturedWarehousesSection,
  FeaturedWarehousesSkeleton,
} from "@/components/landing/featured-warehouses"
import { Features } from "@/components/landing/features"
import { FinalCta } from "@/components/landing/final-cta"
import { ForOwners } from "@/components/landing/for-owners"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { getCropTypes, getPublicWarehouses } from "@/lib/api/public-data"

// Server Component: public data is fetched on the server and cached with ISR
// (see lib/api/public-data.ts), so the page ships as static HTML.
export default async function HomePage() {
  const [cropTypes, warehouseTotal] = await Promise.all([
    getCropTypes().catch(() => []),
    getPublicWarehouses({ limit: 1 })
      .then((result) => result.meta.total)
      .catch(() => null),
  ])

  return (
    <>
      <Hero cropTypes={cropTypes} stats={{ warehouses: warehouseTotal, cropTypes: cropTypes.length }} />
      <HowItWorks />
      <FeaturedWarehousesSection>
        <Suspense fallback={<FeaturedWarehousesSkeleton />}>
          <FeaturedWarehouses />
        </Suspense>
      </FeaturedWarehousesSection>
      <CropGuide cropTypes={cropTypes} />
      <Features />
      <ForOwners />
      <Faq />
      <FinalCta />
    </>
  )
}
