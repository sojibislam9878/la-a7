import { create } from "zustand"

import { clearRoleCookie, setRoleCookie } from "@/lib/auth/role-cookie"
import type { User } from "@/types/user"

export type AuthStatus = "loading" | "authenticated" | "guest"

type AuthState = {
  status: AuthStatus
  user: User | null
  accessToken: string | null
  setSession: (session: { accessToken: string; user: User }) => void
  setUser: (user: User) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: "loading",
  user: null,
  accessToken: null,

  setSession: ({ accessToken, user }) => {
    setRoleCookie(user.role)
    set({ status: "authenticated", accessToken, user })
  },

  setUser: (user) => set({ user }),

  clearSession: () => {
    clearRoleCookie()
    set({ status: "guest", accessToken: null, user: null })
  },
}))
