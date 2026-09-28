"use client"

import { useCallback, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { parseWarehouseQuery, serializeWarehouseQuery } from "@/lib/warehouse-query"
import type { WarehouseQuery } from "@/types/warehouse"

export function useWarehouseQuery() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.toString()

  const query = useMemo(() => parseWarehouseQuery(new URLSearchParams(current)), [current])

  const update = useCallback(
    (changes: Partial<WarehouseQuery>) => {
      const next: WarehouseQuery = { ...query, page: undefined, ...changes }
      const qs = serializeWarehouseQuery(next)
      if (qs === serializeWarehouseQuery(query)) return
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [query, pathname, router]
  )

  return { query, update }
}
