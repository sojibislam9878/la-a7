import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authApi, type LoginPayload, type SignupPayload } from "@/lib/api/auth"
import { useAuthStore } from "@/stores/auth-store"

export function useSignup() {
  return useMutation({
    mutationKey: ["auth", "signup"],
    mutationFn: (payload: SignupPayload) => authApi.signup(payload),
  })
}

export function useVerifyOtp() {
  return useMutation({
    mutationKey: ["auth", "verify-otp"],
    mutationFn: (payload: { email: string; otp: string }) => authApi.verifyOtp(payload),
  })
}

export function useResendOtp() {
  return useMutation({
    mutationKey: ["auth", "resend-otp"],
    mutationFn: (payload: { email: string }) => authApi.resendOtp(payload),
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: ({ data }) => {
      // Drop anything cached for a previous user before switching accounts
      queryClient.clear()
      setSession(data)
    },
  })
}
