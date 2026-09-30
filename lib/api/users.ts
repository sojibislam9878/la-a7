import { authedRequest } from "@/lib/api/authed"
import type { DashboardSummary } from "@/types/dashboard"
import type { FarmerProfile, FarmerProfilePayload } from "@/types/farmer"
import type { OwnerProfile, OwnerProfilePayload } from "@/types/owner"
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
  changePassword: (currentPassword: string, newPassword: string) =>
    authedRequest<null>("/auth/change-password", {
      method: "POST",
      body: { currentPassword, newPassword },
      shouldRefresh: (error) => !/password/i.test(error.message),
    }),
  setPassword: (newPassword: string) =>
    authedRequest<null>("/auth/set-password", { method: "POST", body: { newPassword } }),
  getDashboard: () => authedRequest<DashboardSummary>("/users/me/dashboard"),

  getFarmerProfile: (signal?: AbortSignal) => authedRequest<FarmerProfile>("/users/me/farmer-profile", { signal }),
  createFarmerProfile: (payload: FarmerProfilePayload) =>
    authedRequest<FarmerProfile>("/users/me/farmer-profile", { method: "POST", body: payload }),
  updateFarmerProfile: (payload: FarmerProfilePayload) =>
    authedRequest<FarmerProfile>("/users/me/farmer-profile", { method: "PATCH", body: payload }),

  getOwnerProfile: (signal?: AbortSignal) => authedRequest<OwnerProfile>("/users/me/owner-profile", { signal }),
  createOwnerProfile: (payload: OwnerProfilePayload) =>
    authedRequest<OwnerProfile>("/users/me/owner-profile", { method: "POST", body: payload }),
  updateOwnerProfile: (payload: OwnerProfilePayload) =>
    authedRequest<OwnerProfile>("/users/me/owner-profile", { method: "PATCH", body: payload }),
}
