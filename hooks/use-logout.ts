import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { authApi } from "@/lib/api/auth"
import { useAuthStore } from "@/stores/auth-store"

export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const clearSession = useAuthStore((state) => state.clearSession)

  return useMutation({
    mutationKey: ["auth", "logout"],
    // Revokes the refresh + access token pair (shared jti) on the backend
    mutationFn: () => authApi.logout(),
    // Log out locally even if the request fails (offline, already expired)
    onSettled: () => {
      clearSession()
      queryClient.clear()
      toast.success("You have been logged out")
      router.replace("/login")
    },
  })
}
