"use client"

import { format, parseISO } from "date-fns"
import { CalendarIcon, type LucideIcon, MailIcon, PhoneIcon, ShieldCheckIcon } from "lucide-react"

import { PageHeader } from "@/components/dashboard/page-header"
import { AccountForm } from "@/components/profile/account-form"
import { DeleteAccount } from "@/components/profile/delete-account"
import { PasswordForm } from "@/components/profile/password-form"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { ROLE_LABEL } from "@/constants/routes"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import type { User } from "@/types/user"

export type ProfileFact = { icon: LucideIcon; label: string; value: string }

export function ProfileSection({
  id,
  title,
  description,
  children,
  className,
}: {
  id: string
  title: string
  description: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn("flex flex-col gap-5 rounded-3xl border border-soil/10 bg-card p-5 sm:p-6", className)}
    >
      <div className="flex flex-col gap-1">
        <h2 id={id} className="font-display text-xl font-semibold">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function ProfileSummary({ user, facts }: { user: User; facts: ProfileFact[] }) {
  const all: ProfileFact[] = [
    { icon: MailIcon, label: "Email", value: user.email },
    { icon: PhoneIcon, label: "Phone", value: user.phone ?? "Not added" },
    ...facts,
    { icon: CalendarIcon, label: "Member since", value: format(parseISO(user.createdAt), "MMMM yyyy") },
  ]

  return (
    <aside className="flex flex-col gap-5 overflow-hidden rounded-3xl bg-forest p-6 text-forest-foreground lg:sticky lg:top-20 lg:self-start">
      <div className="flex items-center gap-4">
        <Avatar className="size-16 ring-4 ring-forest-foreground/10">
          <AvatarFallback className="bg-harvest font-display text-xl font-semibold text-harvest-foreground">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-display text-xl font-semibold">{user.name}</p>
          <p className="flex items-center gap-1.5 text-sm text-forest-foreground/75">
            <ShieldCheckIcon className="size-4 text-harvest" aria-hidden />
            {ROLE_LABEL[user.role]} · {user.status === "ACTIVE" ? "Active" : "Banned"}
          </p>
        </div>
      </div>
      <dl className="flex flex-col gap-3 border-t border-forest-foreground/10 pt-5">
        {all.map((fact) => (
          <div key={fact.label} className="flex items-start gap-3">
            <fact.icon className="mt-0.5 size-4 shrink-0 text-harvest" aria-hidden />
            <div className="min-w-0">
              <dt className="text-xs text-forest-foreground/60">{fact.label}</dt>
              <dd className="truncate text-sm font-medium">{fact.value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </aside>
  )
}

export function ProfileView({
  description,
  facts = [],
  canDelete = true,
  deleteNote,
  children,
}: {
  description: string
  facts?: ProfileFact[]
  canDelete?: boolean
  deleteNote?: string
  children?: React.ReactNode
}) {
  const user = useAuthStore((state) => (state.status === "authenticated" ? state.user : null))

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader title="Profile" description={description} />

      {!user ? (
        <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]" aria-busy="true" aria-label="Loading profile">
          <Skeleton className="h-80 rounded-3xl" />
          <div className="flex flex-col gap-6">
            <Skeleton className="h-72 rounded-3xl" />
            <Skeleton className="h-72 rounded-3xl" />
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <ProfileSummary user={user} facts={facts} />
          <div className="flex min-w-0 flex-col gap-6">
            <ProfileSection id="account-heading" title="Account details" description="Your name and how people contact you.">
              <AccountForm key={`${user.name}|${user.phone}`} user={user} />
            </ProfileSection>
            {children}
            <ProfileSection
              id="password-heading"
              title="Password"
              description="Change the password you use to log in with your email."
            >
              <PasswordForm />
            </ProfileSection>
            {canDelete ? (
              <ProfileSection
                id="danger-heading"
                title="Danger zone"
                description="Permanent actions for your account."
                className="border-destructive/30 bg-destructive/5"
              >
                <DeleteAccount />
              </ProfileSection>
            ) : (
              deleteNote && (
                <ProfileSection id="danger-heading" title="Account removal" description={deleteNote} />
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
