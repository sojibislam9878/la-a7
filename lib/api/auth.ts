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

export type LoginPayload = {
  email: string
  password: string
}

export type AuthSession = {
  accessToken: string
  user: User
}

export const authApi = {
  signup: (payload: SignupPayload) =>
    apiRequest<User>("/auth/signup", { method: "POST", body: payload }),

  verifyOtp: (payload: { email: string; otp: string }) =>
    apiRequest<User>("/auth/verify-otp", { method: "POST", body: payload }),

  resendOtp: (payload: { email: string }) =>
    apiRequest<null>("/auth/resend-otp", { method: "POST", body: payload }),

  /** Sets the httpOnly refresh cookie on the API domain */
  login: (payload: LoginPayload) =>
    apiRequest<AuthSession>("/auth/login", { method: "POST", body: payload }),

  /** Uses the refresh cookie; rotates it and returns a fresh access token */
  refresh: () => apiRequest<AuthSession>("/auth/refresh-token", { method: "POST", body: {} }),

  logout: () => apiRequest<null>("/auth/logout", { method: "POST", body: {} }),

  /** Full-page redirect target; Google accounts are always created as FARMER */
  googleUrl: `${env.apiBaseUrl}/auth/google`,
}
