"use client"

import Link from "next/link"
import { ArrowRightIcon, BuildingIcon } from "lucide-react"

import { ProfileSection, ProfileView } from "@/components/profile/profile-view"
import { Button } from "@/components/ui/button"
import { OWNER_ONBOARDING_PATH } from "@/constants/routes"
import { useOwnerProfile } from "@/hooks/use-profile"

export function OwnerProfileView() {
  const owner = useOwnerProfile()
  const business = owner.isError
    ? "Couldn't load"
    : owner.data === undefined
      ? "…"
      : (owner.data?.businessName ?? "Not set up yet")

  return (
    <ProfileView
      description="Your account details. Business details live on your business profile."
      facts={[{ icon: BuildingIcon, label: "Business", value: business }]}
    >
      <ProfileSection
        id="business-link-heading"
        title="Business profile"
        description="Trade license, NID and business address used to verify your warehouses."
      >
        <Button variant="outline" className="w-fit rounded-full" asChild>
          <Link href={OWNER_ONBOARDING_PATH}>
            {owner.data === null ? "Set up business profile" : "Edit business profile"}
            <ArrowRightIcon data-icon="inline-end" aria-hidden />
          </Link>
        </Button>
      </ProfileSection>
    </ProfileView>
  )
}
