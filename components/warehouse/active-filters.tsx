import Link from "next/link"
import { XIcon } from "lucide-react"

import { formatBdt, formatKg } from "@/lib/format"
import { warehouseSearchHref } from "@/lib/warehouse-query"
import type { CropType } from "@/types/crop-type"
import type { WarehouseQuery } from "@/types/warehouse"

/**
 * Server-rendered chips: each is a plain link to the same search without that
 * filter, so removing one works without any client JavaScript.
 */
export function ActiveFilters({ query, cropTypes }: { query: WarehouseQuery; cropTypes: CropType[] }) {
  const chips: { key: string; label: string; href: string }[] = []
  const without = (...keys: (keyof WarehouseQuery)[]) => {
    const next: WarehouseQuery = { ...query, page: undefined }
    for (const key of keys) delete next[key]
    return warehouseSearchHref(next)
  }

  if (query.search) chips.push({ key: "search", label: `"${query.search}"`, href: without("search") })
  if (query.district) chips.push({ key: "district", label: query.district, href: without("district") })
  if (query.cropTypeId) {
    const crop = cropTypes.find((c) => c.id === query.cropTypeId)
    chips.push({ key: "crop", label: crop ? `For ${crop.name}` : "Selected crop", href: without("cropTypeId") })
  }
  if (query.minCapacityKg) {
    chips.push({ key: "capacity", label: `${formatKg(query.minCapacityKg)}+ chamber`, href: without("minCapacityKg") })
  }
  if (query.minRate !== undefined || query.maxRate !== undefined) {
    const min = query.minRate !== undefined ? formatBdt(query.minRate, { maximumFractionDigits: 3 }) : "any"
    const max = query.maxRate !== undefined ? formatBdt(query.maxRate, { maximumFractionDigits: 3 }) : "any"
    chips.push({ key: "rate", label: `${min} to ${max} /kg/day`, href: without("minRate", "maxRate") })
  }
  if (query.minRating) chips.push({ key: "rating", label: `${query.minRating}+ stars`, href: without("minRating") })

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Filtered by:</span>
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={chip.href}
          scroll={false}
          replace
          className="group flex h-7 items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 pr-2 pl-3 text-sm text-primary transition-colors hover:bg-primary/15 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {chip.label}
          <XIcon className="size-3.5 opacity-70 group-hover:opacity-100" aria-hidden />
          <span className="sr-only">Remove filter</span>
        </Link>
      ))}
      {chips.length > 1 && (
        <Link
          href="/warehouses"
          scroll={false}
          replace
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Clear all
        </Link>
      )}
    </div>
  )
}
