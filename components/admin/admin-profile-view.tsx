"use client"

import { KeyRoundIcon } from "lucide-react"

import { ProfileView } from "@/components/profile/profile-view"

export function AdminProfileView() {
  return (
    <ProfileView
      description="Your admin account details and password."
      facts={[{ icon: KeyRoundIcon, label: "Access", value: "Full platform administration" }]}
      canDelete={false}
      deleteNote="Admin accounts can't be deleted from the app, and admins can't change each other's accounts. This keeps the platform from being locked out. Ask the platform operator if an admin account needs to be removed."
    />
  )
}
