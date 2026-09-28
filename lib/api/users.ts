import { authedRequest } from "@/lib/api/authed"
import type { DashboardSummary } from "@/types/dashboard"
import type { User } from "@/types/user"

export const usersApi = {
  getMe: () => authedRequest<User>("/users/me"),
  getDashboard: () => authedRequest<DashboardSummary>("/users/me/dashboard"),
}
