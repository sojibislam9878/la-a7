import { authedRequest } from "@/lib/api/authed"
import type { PlatformStats } from "@/types/admin"

export const adminApi = {
  stats: (signal?: AbortSignal) => authedRequest<PlatformStats>("/admin/stats", { signal }),
}
