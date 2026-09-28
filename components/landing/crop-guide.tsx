import Link from "next/link"
import { CalendarDaysIcon, ThermometerIcon } from "lucide-react"

import { SectionHeading } from "@/components/landing/section-heading"
import { formatTempRange } from "@/lib/format"
import type { CropType } from "@/types/crop-type"

const MAX_CROPS = 8

export function CropGuide({ cropTypes }: { cropTypes: CropType[] }) {
  if (cropTypes.length === 0) return null

  return (
    <section id="crops" className="scroll-mt-20 border-y bg-muted/40 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Crop guide"
          title="The right temperature for every crop"
          description="Each booking is matched to a chamber whose temperature range fits your crop's ideal range, so nothing spoils on the shelf."
        />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cropTypes.slice(0, MAX_CROPS).map((crop) => (
            <li key={crop.id}>
              <Link
                href={`/warehouses?cropTypeId=${crop.id}`}
                className="flex h-full flex-col gap-3 rounded-2xl border bg-card p-5 transition-colors hover:border-primary/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="font-semibold">{crop.name}</span>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ThermometerIcon className="size-4 text-primary" aria-hidden />
                  {formatTempRange(crop.idealMinTempC, crop.idealMaxTempC)}
                </span>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDaysIcon className="size-4 text-primary" aria-hidden />
                  Up to {crop.maxStorageDays} days
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
