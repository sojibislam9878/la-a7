"use client"

import { useCallback, useMemo } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { availabilityApi, type AvailabilityParams } from "@/lib/api/availability"
import { parseAvailabilitySelection, type AvailabilitySelection } from "@/lib/availability-query"
import { queryKeys } from "@/lib/query-keys"

const AVAILABILITY_STALE_MS = 30 * 1000

export function useAvailabilitySelection() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.toString()

  const selection = useMemo(() => parseAvailabilitySelection(new URLSearchParams(current)), [current])

  const update = useCallback(
    (changes: Partial<AvailabilitySelection>) => {
      const params = new URLSearchParams(current)
      for (const [key, value] of Object.entries(changes)) {
        if (value === undefined || value === "") params.delete(key)
        else params.set(key, String(value))
      }
      const qs = params.toString()
      if (qs === current) return
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [current, pathname, router]
  )

  const params: AvailabilityParams | null = useMemo(
    () =>
      selection.from && selection.to
        ? { startDate: selection.from, endDate: selection.to, ...(selection.crop ? { cropTypeId: selection.crop } : {}) }
        : null,
    [selection.from, selection.to, selection.crop]
  )

  return { selection, params, update }
}

export function useWarehouseAvailability(warehouseId: string, params: AvailabilityParams | null) {
  return useQuery({
    queryKey: params ? queryKeys.warehouseAvailability(warehouseId, params) : ["availability", "idle"],
    queryFn: async ({ signal }) => (await availabilityApi.warehouse(warehouseId, params!, signal)).data,
    enabled: params !== null,
    staleTime: AVAILABILITY_STALE_MS,
    placeholderData: keepPreviousData,
  })
}

export function useChamberAvailability(chamberId: string | undefined, params: AvailabilityParams | null) {
  return useQuery({
    queryKey: chamberId && params ? queryKeys.chamberAvailability(chamberId, params) : ["availability", "idle"],
    queryFn: async ({ signal }) => (await availabilityApi.chamber(chamberId!, params!, signal)).data,
    enabled: Boolean(chamberId && params),
    staleTime: AVAILABILITY_STALE_MS,
  })
}
