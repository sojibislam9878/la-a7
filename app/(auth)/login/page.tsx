import type { Metadata } from "next"

import { LoginForm } from "@/components/auth/login-form"
import { safeRedirect } from "@/constants/routes"

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to AgroStore to manage your cold storage bookings.",
}

// Server Component shell: `?redirect=` comes from the route guard, `?email=`
// from the OTP verification page.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { redirect, email } = await searchParams

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back</h1>
        <p className="text-muted-foreground">Log in to check your storage, bookings and payments.</p>
      </div>
      <LoginForm
        redirectTo={safeRedirect(redirect)}
        defaultEmail={typeof email === "string" ? email : undefined}
      />
    </div>
  )
}
