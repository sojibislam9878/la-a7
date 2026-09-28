import { PageLinks } from "@/components/shared/page-links"
import { warehouseSearchHref } from "@/lib/warehouse-query"
import type { PaginationMeta } from "@/types/api"
import type { WarehouseQuery } from "@/types/warehouse"

export function ResultsPagination({ query, meta }: { query: WarehouseQuery; meta: PaginationMeta }) {
  return (
    <PageLinks page={meta.page} totalPages={meta.totalPages} hrefFor={(page) => warehouseSearchHref({ ...query, page })} />
  )
}
