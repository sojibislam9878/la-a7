"use client"

import { MapPinIcon } from "lucide-react"

import { FarmerProfileSection } from "@/components/profile/farmer-profile-form"
import { ProfileSection, ProfileView } from "@/components/profile/profile-view"
import { useFarmerProfile } from "@/hooks/use-profile"

export function FarmerProfileView() {
  const farmer = useFarmerProfile()
  const location =
    farmer.data === undefined
      ? "…"
      : farmer.data === null
        ? "Not added"
        : [farmer.data.upazila, farmer.data.district].filter(Boolean).join(", ")

  return (
    <ProfileView
      description="Your account details and farming profile."
      facts={[{ icon: MapPinIcon, label: "Farm location", value: location }]}
    >
      <ProfileSection id="farming-heading" title="Farming profile" description="Where you farm and how much land you work.">
        <FarmerProfileSection />
      </ProfileSection>
    </ProfileView>
  )
}
