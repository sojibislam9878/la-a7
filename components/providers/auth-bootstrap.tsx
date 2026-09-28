"use client"

import { useEffect } from "react"

import { hasRoleCookie } from "@/lib/auth/role-cookie"
import { refreshSession } from "@/lib/auth/session"
import { useAuthStore } from "@/stores/auth-store"

export function AuthBootstrap() {
  useEffect(() => {
    const { status, clearSession } = useAuthStore.getState()
    if (status !== "loading") return

    if (hasRoleCookie()) {
      void refreshSession()
    } else {
      clearSession()
    }
  }, [])

  return null
}
