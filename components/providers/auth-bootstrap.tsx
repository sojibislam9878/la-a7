"use client"

import { useEffect } from "react"

import { hasRoleCookie } from "@/lib/auth/role-cookie"
import { refreshSession } from "@/lib/auth/session"
import { useAuthStore } from "@/stores/auth-store"

/** Restores the session from the refresh cookie once per page load */
export function AuthBootstrap() {
  useEffect(() => {
    const { status, clearSession } = useAuthStore.getState()
    if (status !== "loading") return

    // No hint cookie means nobody logged in on this browser: skip a guaranteed 401
    if (hasRoleCookie()) {
      void refreshSession()
    } else {
      clearSession()
    }
  }, [])

  return null
}
