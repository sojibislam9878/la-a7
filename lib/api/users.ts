import { authedRequest } from "@/lib/api/authed"
import type { DashboardSummary } from "@/types/dashboard"
import type { FarmerProfile, FarmerProfilePayload } from "@/types/farmer"
import type { User } from "@/types/user"

export type UpdateMePayload = { name?: string; phone?: string }

export const usersApi = {
  getMe: () => authedRequest<User>("/users/me"),
  updateMe: (payload: UpdateMePayload) => authedRequest<User>("/users/me", { method: "PATCH", body: payload }),
  deleteMe: (password?: string) =>
    authedRequest<null>("/users/me", {
      method: "DELETE",
      body: password ? { password } : {},
      shouldRefresh: (error) => !/password/i.test(error.message),
    }),
  getDashboard: () => authedRequest<DashboardSummary>("/users/me/dashboard"),

  getFarmerProfile: (signal?: AbortSignal) => authedRequest<FarmerProfile>("/users/me/farmer-profile", { signal }),
  createFarmerProfile: (payload: FarmerProfilePayload) =>
    authedRequest<FarmerProfile>("/users/me/farmer-profile", { method: "POST", body: payload }),
  updateFarmerProfile: (payload: FarmerProfilePayload) =>
    authedRequest<FarmerProfile>("/users/me/farmer-profile", { method: "PATCH", body: payload }),
}
