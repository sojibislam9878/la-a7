import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BuildingIcon, MapPinIcon } from "lucide-react"

import { AvailabilityPanel } from "@/components/warehouse/detail/availability-panel"
import { ChamberList } from "@/components/warehouse/detail/chamber-list"
import { ChamberLoadSection } from "@/components/warehouse/detail/chamber-load-section"
import { ReviewList } from "@/components/warehouse/detail/review-list"
import { WarehouseHero } from "@/components/warehouse/detail/warehouse-hero"
import { initials } from "@/lib/format"
import {
  getCropTypes,
  getPublicWarehouse,
  getWarehouseChambers,
  getWarehouseReviews,
} from "@/lib/api/public-data"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const REVIEWS_PER_PAGE = 5

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const warehouse = await getPublicWarehouse((await params).id)
  if (!warehouse) return { title: "Warehouse not found" }
  return {
    title: `${warehouse.name}, ${warehouse.district}`,
    description: `Cold storage in ${warehouse.address}, ${warehouse.district}. Check live availability and book capacity by the kilogram.`,
  }
}

function reviewsPageFrom(value: string | string[] | undefined) {
  const page = Number(Array.isArray(value) ? value[0] : value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

export default async function WarehouseDetailPage({ params, searchParams }: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const warehouse = await getPublicWarehouse(id)
  if (!warehouse) notFound()

  const reviewsPage = reviewsPageFrom(query.reviewsPage)
  const [chambers, reviews, cropTypes] = await Promise.all([
    getWarehouseChambers(id).catch(() => []),
    getWarehouseReviews(id, reviewsPage, REVIEWS_PER_PAGE).catch(() => ({
      items: [],
      meta: { page: 1, limit: REVIEWS_PER_PAGE, total: 0, totalPages: 0 },
    })),
    getCropTypes().catch(() => []),
  ])

  const pageHref = (page: number) => {
    const next = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      const first = Array.isArray(value) ? value[0] : value
      if (first && key !== "reviewsPage") next.set(key, first)
    }
    if (page > 1) next.set("reviewsPage", String(page))
    const qs = next.toString()
    return `/warehouses/${id}${qs ? `?${qs}` : ""}#reviews`
  }

  const operator = warehouse.owner.businessName || warehouse.owner.name

  return (
    <>
      <WarehouseHero warehouse={warehouse} />

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-8 lg:py-12">
        <aside className="lg:order-2">
          <div className="lg:sticky lg:top-24">
            <AvailabilityPanel warehouse={warehouse} cropTypes={cropTypes} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-10 lg:order-1">
          <ChamberLoadSection warehouseId={warehouse.id} />
          <ChamberList chambers={chambers} />

          <section aria-labelledby="operator-heading" className="flex flex-col gap-4">
            <h2 id="operator-heading" className="font-display text-2xl font-semibold">
              Operated by
            </h2>
            <div className="flex items-center gap-4 rounded-2xl border border-soil/10 bg-card p-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-[58%_42%_52%_48%/55%_48%_52%_45%] bg-harvest/25 font-semibold text-harvest-foreground dark:text-harvest">
                {initials(operator)}
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <p className="flex items-center gap-2 font-semibold">
                  <BuildingIcon className="size-4 text-muted-foreground" aria-hidden />
                  {operator}
                </p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPinIcon className="size-4" aria-hidden />
                  {warehouse.address}, {warehouse.district}
                </p>
              </div>
            </div>
          </section>

          <ReviewList
            reviews={reviews}
            avgRating={warehouse.avgRating}
            reviewCount={warehouse.reviewCount}
            pageHref={pageHref}
          />
        </div>
      </div>
    </>
  )
}
