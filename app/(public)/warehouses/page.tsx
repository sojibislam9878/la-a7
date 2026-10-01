import { Suspense } from "react"
import type { Metadata } from "next"

import { PageHero } from "@/components/shared/page-hero"
import { ActiveFilters } from "@/components/warehouse/active-filters"
import { FilterPanel } from "@/components/warehouse/filter-panel"
import { MobileFilters } from "@/components/warehouse/mobile-filters"
import { SearchInput } from "@/components/warehouse/search-input"
import { SortSelect } from "@/components/warehouse/sort-select"
import { WarehouseResults, WarehouseResultsSkeleton } from "@/components/warehouse/warehouse-results"
import { getCropTypes } from "@/lib/api/public-data"
import { parseWarehouseQuery, serializeWarehouseQuery } from "@/lib/warehouse-query"

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { district } = parseWarehouseQuery(await searchParams)
  return {
    title: district ? `Cold storage in ${district}` : "Find cold storage",
    description: "Search approved cold storage warehouses across Bangladesh by district, crop, capacity, price and rating.",
  }
}

export default async function WarehousesPage({ searchParams }: PageProps) {
  const query = parseWarehouseQuery(await searchParams)
  const cropTypes = await getCropTypes().catch(() => [])

  return (
    <>
      <PageHero
        eyebrow="Find storage"
        title="Cold storage for every harvest"
        description="Every warehouse here is verified and approved. Filter by where you farm, what you grow and how much space you need."
      />

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:px-8 lg:py-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border border-soil/10 bg-cream/60 p-5">
            <FilterPanel cropTypes={cropTypes} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchInput />
            <div className="flex gap-3">
              <MobileFilters cropTypes={cropTypes} />
              <SortSelect />
            </div>
          </div>

          <ActiveFilters query={query} cropTypes={cropTypes} />

          <Suspense key={serializeWarehouseQuery(query)} fallback={<WarehouseResultsSkeleton />}>
            <WarehouseResults query={query} />
          </Suspense>
        </div>
      </div>
    </>
  )
}
