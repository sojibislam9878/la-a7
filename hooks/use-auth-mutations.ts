import { useMutation } from "@tanstack/react-query"

import { authApi, type SignupPayload } from "@/lib/api/auth"

export function useSignup() {
  return useMutation({
    mutationKey: ["auth", "signup"],
    mutationFn: (payload: SignupPayload) => authApi.signup(payload),
  })
}
