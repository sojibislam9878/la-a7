import type { Metadata } from "next"

import { AuthSteps } from "@/components/auth/auth-steps"
import { VerifyOtpForm } from "@/components/auth/verify-otp-form"

export const metadata: Metadata = {
  title: "Verify email",
  description: "Enter the 6-digit code we emailed you to activate your AgroStore account.",
}

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { email, sent } = await searchParams

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <AuthSteps current={2} />
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Check your inbox</h1>
          <p className="text-muted-foreground">
            Enter the 6-digit code we emailed you. It expires in 10 minutes.
          </p>
        </div>
      </div>
      <VerifyOtpForm defaultEmail={typeof email === "string" ? email : ""} codeNotSent={sent === "0"} />
    </div>
  )
}
