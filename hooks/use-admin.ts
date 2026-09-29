import { useQuery } from "@tanstack/react-query"

import { adminApi } from "@/lib/api/admin"
import { queryKeys } from "@/lib/query-keys"
import { useAuthStore } from "@/stores/auth-store"

export function useAdminStats() {
  const enabled = useAuthStore((state) => state.status === "authenticated" && state.user?.role === "ADMIN")

  return useQuery({
    queryKey: queryKeys.adminStats,
    queryFn: async ({ signal }) => (await adminApi.stats(signal)).data,
    enabled,
    staleTime: 60 * 1000,
  })
}
