import { keepPreviousData, useQueries, useQuery } from "@tanstack/react-query"

import { QUALITY_GRADES } from "@/constants/quality-grade"
import { adminApi } from "@/lib/api/admin"
import { queryKeys } from "@/lib/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { Inspection, InspectionQuery } from "@/types/admin"
import type { Paginated } from "@/types/api"
import type { QualityGrade } from "@/types/booking"

function useIsAdmin() {
  return useAuthStore((state) => state.status === "authenticated" && state.user?.role === "ADMIN")
}

export function useInspections(query: InspectionQuery) {
  const enabled = useIsAdmin()
  return useQuery({
    queryKey: queryKeys.inspections(query),
    queryFn: async ({ signal }): Promise<Paginated<Inspection>> => {
      const result = await adminApi.inspections(query, signal)
      return {
        items: result.data,
        meta: result.meta ?? { page: 1, limit: result.data.length, total: result.data.length, totalPages: 1 },
      }
    },
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useGradeCounts() {
  const enabled = useIsAdmin()
  return useQueries({
    queries: QUALITY_GRADES.map((grade) => ({
      queryKey: [...queryKeys.inspections({ grade, limit: 1 }), "count"],
      queryFn: async ({ signal }: { signal: AbortSignal }) =>
        (await adminApi.inspections({ grade, limit: 1 }, signal)).meta?.total ?? 0,
      enabled,
    })),
    combine: (results) => {
      if (results.some((result) => result.data === undefined)) return null
      return Object.fromEntries(QUALITY_GRADES.map((grade, i) => [grade, results[i].data])) as Record<QualityGrade, number>
    },
  })
}
