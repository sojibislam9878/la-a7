import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { warehouseSearchHref } from "@/lib/warehouse-query"
import type { PaginationMeta } from "@/types/api"
import type { WarehouseQuery } from "@/types/warehouse"

function pageWindow(current: number, total: number): (number | "gap")[] {
  const pages = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const result: (number | "gap")[] = []
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push("gap")
    result.push(page)
  })
  return result
}

export function ResultsPagination({ query, meta }: { query: WarehouseQuery; meta: PaginationMeta }) {
  if (meta.totalPages <= 1) return null

  const hrefFor = (page: number) => warehouseSearchHref({ ...query, page })
  const prev = meta.page > 1 ? hrefFor(meta.page - 1) : null
  const next = meta.page < meta.totalPages ? hrefFor(meta.page + 1) : null
  const pageClass = (active = false) =>
    cn(
      buttonVariants({ variant: active ? "default" : "ghost", size: "icon" }),
      "size-10 rounded-xl",
      !active && "hover:bg-cream"
    )

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      {prev ? (
        <Link href={prev} className={cn(buttonVariants({ variant: "ghost" }), "h-10 rounded-xl")} rel="prev">
          <ChevronLeftIcon data-icon="inline-start" aria-hidden />
          <span className="hidden sm:inline">Previous</span>
          <span className="sr-only sm:hidden">Previous page</span>
        </Link>
      ) : (
        <span className={cn(buttonVariants({ variant: "ghost" }), "pointer-events-none h-10 rounded-xl opacity-40")} aria-hidden>
          <ChevronLeftIcon />
          <span className="hidden sm:inline">Previous</span>
        </span>
      )}

      <ul className="flex items-center gap-1">
        {pageWindow(meta.page, meta.totalPages).map((item, index) =>
          item === "gap" ? (
            <li key={`gap-${index}`} className="px-1 text-muted-foreground" aria-hidden>
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefFor(item)}
                aria-current={item === meta.page ? "page" : undefined}
                aria-label={`Page ${item}`}
                className={pageClass(item === meta.page)}
              >
                {item}
              </Link>
            </li>
          )
        )}
      </ul>

      {next ? (
        <Link href={next} className={cn(buttonVariants({ variant: "ghost" }), "h-10 rounded-xl")} rel="next">
          <span className="hidden sm:inline">Next</span>
          <span className="sr-only sm:hidden">Next page</span>
          <ChevronRightIcon data-icon="inline-end" aria-hidden />
        </Link>
      ) : (
        <span className={cn(buttonVariants({ variant: "ghost" }), "pointer-events-none h-10 rounded-xl opacity-40")} aria-hidden>
          <span className="hidden sm:inline">Next</span>
          <ChevronRightIcon />
        </span>
      )}
    </nav>
  )
}
