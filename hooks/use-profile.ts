import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { authApi } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import { type UpdateMePayload, usersApi } from "@/lib/api/users"
import { queryKeys } from "@/lib/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { FarmerProfile, FarmerProfilePayload } from "@/types/farmer"
import type { OwnerProfile, OwnerProfilePayload } from "@/types/owner"

export function useFarmerProfile() {
  const authenticated = useAuthStore((state) => state.status === "authenticated")

  return useQuery({
    queryKey: queryKeys.farmerProfile,
    queryFn: async ({ signal }): Promise<FarmerProfile | null> => {
      try {
        return (await usersApi.getFarmerProfile(signal)).data
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null
        throw error
      }
    },
    enabled: authenticated,
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationKey: ["users", "update-me"],
    mutationFn: async (payload: UpdateMePayload) => (await usersApi.updateMe(payload)).data,
    onSuccess: (user) => {
      setUser(user)
      queryClient.setQueryData(queryKeys.me, user)
      toast.success("Account details saved")
    },
  })
}

export function useSaveFarmerProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["users", "farmer-profile"],
    mutationFn: async ({ payload, create }: { payload: FarmerProfilePayload; create: boolean }) =>
      (await (create ? usersApi.createFarmerProfile(payload) : usersApi.updateFarmerProfile(payload))).data,
    onSuccess: (profile, { create }) => {
      queryClient.setQueryData(queryKeys.farmerProfile, profile)
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      toast.success(create ? "Farming profile created" : "Farming profile saved")
    },
  })
}

export function useDeleteAccount() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const clearSession = useAuthStore((state) => state.clearSession)

  return useMutation({
    mutationKey: ["users", "delete-me"],
    mutationFn: async (password?: string) => {
      await usersApi.deleteMe(password)
    },
    onSuccess: async () => {
      await authApi.logout().catch(() => undefined)
      clearSession({ signedOut: true })
      queryClient.clear()
      toast.success("Your account was deleted", { description: "Thanks for using AgroStore." })
      router.replace("/")
    },
  })
}

export function useSavePassword() {
  return useMutation({
    mutationKey: ["users", "password"],
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword?: string; newPassword: string }) => {
      if (currentPassword === undefined) await usersApi.setPassword(newPassword)
      else await usersApi.changePassword(currentPassword, newPassword)
    },
    onSuccess: (_data, { currentPassword }) => {
      toast.success(currentPassword === undefined ? "Password set" : "Password changed", {
        description:
          currentPassword === undefined
            ? "You can now log in with your email and password as well as Google."
            : "Use the new password next time you log in.",
      })
    },
  })
}

export function useOwnerProfile() {
  const authenticated = useAuthStore((state) => state.status === "authenticated")

  return useQuery({
    queryKey: queryKeys.ownerProfile,
    queryFn: async ({ signal }): Promise<OwnerProfile | null> => {
      try {
        return (await usersApi.getOwnerProfile(signal)).data
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null
        throw error
      }
    },
    enabled: authenticated,
  })
}

export function useSaveOwnerProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["users", "owner-profile"],
    mutationFn: async ({ payload, create }: { payload: OwnerProfilePayload; create: boolean }) =>
      (await (create ? usersApi.createOwnerProfile(payload) : usersApi.updateOwnerProfile(payload))).data,
    onSuccess: (profile, { create }) => {
      queryClient.setQueryData(queryKeys.ownerProfile, profile)
      if (create) {
        const { user, setUser } = useAuthStore.getState()
        if (user) {
          const updated = { ...user, profileComplete: true }
          setUser(updated)
          queryClient.setQueryData(queryKeys.me, updated)
        }
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      if (!create) toast.success("Business profile saved")
    },
  })
}
