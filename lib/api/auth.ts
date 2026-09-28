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

  login: (payload: LoginPayload) =>
    apiRequest<AuthSession>("/auth/login", { method: "POST", body: payload }),

  refresh: () =>
    apiRequest<AuthSession>("/auth/refresh-token", { method: "POST", body: {}, keepalive: true }),

  logout: () => apiRequest<null>("/auth/logout", { method: "POST", body: {}, keepalive: true }),

  googleUrl: `${env.apiBaseUrl}/auth/google`,
}
