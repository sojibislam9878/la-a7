import type { Metadata } from "next"

import { CropGuide } from "@/components/landing/crop-guide"
import { FinalCta } from "@/components/landing/final-cta"
import { PageHero } from "@/components/shared/page-hero"
import { getCropTypes } from "@/lib/api/public-data"

export const metadata: Metadata = {
  title: "Crop storage guide",
  description: "Ideal cold storage temperatures and the longest safe storage time for each crop AgroStore supports.",
}

export default async function CropGuidePage() {
  const cropTypes = await getCropTypes().catch(() => [])

  return (
    <>
      <PageHero
        eyebrow="Crop guide"
        title="The right temperature for every crop"
        description="Each booking is matched to a chamber whose temperature range fits your crop's ideal range."
      />
      {cropTypes.length > 0 ? (
        <CropGuide cropTypes={cropTypes} />
      ) : (
        <p className="mx-auto max-w-7xl px-4 py-16 text-muted-foreground sm:px-6 lg:px-8">
          The crop guide is unavailable right now. Please try again in a moment.
        </p>
      )}
      <FinalCta />
    </>
  )
}
