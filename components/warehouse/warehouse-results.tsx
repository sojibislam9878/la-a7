import Link from "next/link"
import { SearchXIcon, TriangleAlertIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { ResultsPagination } from "@/components/warehouse/results-pagination"
import { WarehouseCard } from "@/components/warehouse/warehouse-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getPublicWarehouses } from "@/lib/api/public-data"
import { formatNumber } from "@/lib/format"
import { countActiveFilters, WAREHOUSE_PAGE_SIZE } from "@/lib/warehouse-query"
import type { WarehouseQuery } from "@/types/warehouse"

const gridClass = "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"

/** Async Server Component: fetched on the server, streamed behind Suspense */
export async function WarehouseResults({ query }: { query: WarehouseQuery }) {
  const result = await getPublicWarehouses({ ...query, limit: WAREHOUSE_PAGE_SIZE }).catch((error: unknown) =>
    error instanceof Error ? error : new Error("Could not load warehouses")
  )

  if (result instanceof Error) {
    return (
      <EmptyState
        icon={TriangleAlertIcon}
        title="We couldn't load warehouses"
        description={result.message}
        action={
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/warehouses">Clear filters and try again</Link>
          </Button>
        }
      />
    )
  }

  const { items, meta } = result
  const filtered = countActiveFilters(query) > 0 || !!query.search

  if (items.length === 0) {
    return (
      <EmptyState
        icon={SearchXIcon}
        title={meta.total === 0 && !filtered ? "No warehouses listed yet" : "No warehouses match your search"}
        description={
          filtered
            ? "Try a different district or crop, widen the price range, or remove a filter."
            : "Approved cold storage warehouses will appear here as soon as they are listed."
        }
        action={
          filtered && (
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/warehouses">Clear all filters</Link>
            </Button>
          )
        }
      />
    )
  }

  const first = (meta.page - 1) * meta.limit + 1
  const last = first + items.length - 1

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing <span className="font-medium text-foreground">{first}</span> to{" "}
        <span className="font-medium text-foreground">{last}</span> of{" "}
        <span className="font-medium text-foreground">{formatNumber(meta.total)}</span>{" "}
        {meta.total === 1 ? "warehouse" : "warehouses"}
      </p>
      <ul className={gridClass}>
        {items.map((warehouse) => (
          <li key={warehouse.id}>
            <WarehouseCard warehouse={warehouse} />
          </li>
        ))}
      </ul>
      <ResultsPagination query={query} meta={meta} />
    </div>
  )
}

export function WarehouseResultsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading warehouses">
      <Skeleton className="h-4 w-52" />
      <div className={gridClass}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex flex-col gap-4 rounded-xl border border-soil/10 bg-card p-6">
            <div className="flex justify-between">
              <Skeleton className="size-10 rounded-xl" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
            </div>
            <Skeleton className="mt-2 h-7 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  )
}
