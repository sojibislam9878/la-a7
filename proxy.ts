import { NextResponse, type NextRequest } from "next/server"

import { ROLE_HOME } from "@/constants/routes"
import { parseRole, ROLE_COOKIE } from "@/lib/auth/role-cookie"
import type { Role } from "@/types/user"

/**
 * Optimistic route guard. It only reads the `agro_role` hint cookie, so it can
 * redirect before any HTML is sent; the dashboard's client guard re-checks the
 * real session and the backend authorizes every API call.
 */
const ROLE_AREAS: { prefix: string; role: Role }[] = [
  { prefix: "/farmer", role: "FARMER" },
  { prefix: "/owner", role: "WAREHOUSE_OWNER" },
  { prefix: "/admin", role: "ADMIN" },
  { prefix: "/payment", role: "FARMER" },
]

const GUEST_ONLY = ["/login", "/register"]

function matches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const role = parseRole(request.cookies.get(ROLE_COOKIE)?.value)
  const redirect = (path: string) => NextResponse.redirect(new URL(path, request.url))

  const loginWithReturn = () => {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", `${pathname}${search}`)
    return NextResponse.redirect(url)
  }

  if (matches(pathname, "/dashboard")) {
    return role ? redirect(ROLE_HOME[role]) : loginWithReturn()
  }

  const area = ROLE_AREAS.find((a) => matches(pathname, a.prefix))
  if (area) {
    if (!role) return loginWithReturn()
    if (role !== area.role) return redirect(ROLE_HOME[role])
    return NextResponse.next()
  }

  if (role && GUEST_ONLY.some((path) => matches(pathname, path))) {
    return redirect(ROLE_HOME[role])
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/farmer/:path*",
    "/owner/:path*",
    "/admin/:path*",
    "/payment/:path*",
    "/login",
    "/register",
  ],
}
