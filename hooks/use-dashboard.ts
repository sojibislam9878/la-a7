import { useQuery } from "@tanstack/react-query"

import { usersApi } from "@/lib/api/users"
import { queryKeys } from "@/lib/query-keys"
import { useAuthStore } from "@/stores/auth-store"

export function useDashboardSummary() {
  const authenticated = useAuthStore((state) => state.status === "authenticated")

  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => (await usersApi.getDashboard()).data,
    enabled: authenticated,
  })
}
