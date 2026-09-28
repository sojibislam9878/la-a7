import Link from "next/link"
import { ArrowRightIcon, WarehouseIcon } from "lucide-react"

import { SectionHeading } from "@/components/landing/section-heading"
import { WarehouseCard } from "@/components/warehouse/warehouse-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getPublicWarehouses } from "@/lib/api/public-data"

export function FeaturedWarehousesSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            align="left"
            eyebrow="Featured storage"
            title="Top rated cold storage near you"
            description="Every warehouse is verified and approved by our team before it can accept bookings."
          />
          <Button variant="outline" asChild>
            <Link href="/warehouses">
              Browse all
              <ArrowRightIcon data-icon="inline-end" aria-hidden />
            </Link>
          </Button>
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  )
}

/** Async Server Component, streamed in behind a Suspense boundary */
export async function FeaturedWarehouses() {
  const result = await getPublicWarehouses({ sortBy: "avgRating", sortOrder: "desc", limit: 6 }).catch(
    () => null
  )

  if (!result) {
    return (
      <EmptyNotice
        title="Warehouses are unavailable right now"
        description="We could not reach the storage directory. Please try again in a moment."
      />
    )
  }

  if (result.items.length === 0) {
    return (
      <EmptyNotice
        title="No warehouses listed yet"
        description="Approved cold storage warehouses will appear here as soon as they are listed."
      />
    )
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {result.items.map((warehouse) => (
        <li key={warehouse.id}>
          <WarehouseCard warehouse={warehouse} />
        </li>
      ))}
    </ul>
  )
}

export function FeaturedWarehousesSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading warehouses">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex flex-col gap-4 rounded-xl border p-6">
          <Skeleton className="size-10 rounded-xl" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-4 h-6 w-1/3" />
        </div>
      ))}
    </div>
  )
}

function EmptyNotice({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-14 text-center">
      <WarehouseIcon className="size-8 text-muted-foreground" aria-hidden />
      <p className="font-semibold">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
