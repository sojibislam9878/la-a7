import { create } from "zustand"

import { clearRoleCookie, setRoleCookie } from "@/lib/auth/role-cookie"
import type { User } from "@/types/user"

export type AuthStatus = "loading" | "authenticated" | "guest"

type AuthState = {
  status: AuthStatus
  user: User | null
  accessToken: string | null
  signedOut: boolean
  setSession: (session: { accessToken: string; user: User }) => void
  setUser: (user: User) => void
  clearSession: (options?: { signedOut?: boolean }) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: "loading",
  user: null,
  accessToken: null,
  signedOut: false,

  setSession: ({ accessToken, user }) => {
    setRoleCookie(user.role)
    set({ status: "authenticated", accessToken, user, signedOut: false })
  },

  setUser: (user) => set({ user }),

  clearSession: ({ signedOut = false } = {}) => {
    clearRoleCookie()
    set({ status: "guest", accessToken: null, user: null, signedOut })
  },
}))
