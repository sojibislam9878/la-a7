import { apiRequest } from "@/lib/api/client"
import { env } from "@/lib/env"
import type { SelfServiceRole, User } from "@/types/user"

export type SignupPayload = {
  name: string
  email: string
  password: string
  phone?: string
  role: SelfServiceRole
}

export const authApi = {
  signup: (payload: SignupPayload) =>
    apiRequest<User>("/auth/signup", { method: "POST", body: payload }),

  verifyOtp: (payload: { email: string; otp: string }) =>
    apiRequest<User>("/auth/verify-otp", { method: "POST", body: payload }),

  resendOtp: (payload: { email: string }) =>
    apiRequest<null>("/auth/resend-otp", { method: "POST", body: payload }),

  /** Full-page redirect target; Google accounts are always created as FARMER */
  googleUrl: `${env.apiBaseUrl}/auth/google`,
}
