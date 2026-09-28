import type { Metadata } from "next"

import { AuthSteps } from "@/components/auth/auth-steps"
import { RegisterForm } from "@/components/auth/register-form"
import type { SelfServiceRole } from "@/types/user"

export const metadata: Metadata = {
  title: "Create account",
  description: "Sign up as a farmer to book cold storage, or as a warehouse owner to list your storage.",
}

function parseRole(value: string | string[] | undefined): SelfServiceRole {
  return value === "WAREHOUSE_OWNER" ? "WAREHOUSE_OWNER" : "FARMER"
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { role } = await searchParams

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <AuthSteps current={1} />
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Let&apos;s get you growing
          </h1>
          <p className="text-muted-foreground">
            Create a free account to book cold storage for your harvest, or to list your warehouse.
          </p>
        </div>
      </div>
      <RegisterForm defaultRole={parseRole(role)} />
    </div>
  )
}
