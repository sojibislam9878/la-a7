"use client"

import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import {
  AlertCircleIcon,
  BadgeCheckIcon,
  BuildingIcon,
  CalendarCheckIcon,
  CheckIcon,
  LockKeyholeIcon,
  RotateCwIcon,
  ShieldCheckIcon,
  SnowflakeIcon,
} from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/dashboard/page-header"
import { OwnerProfileForm } from "@/components/owner/owner-profile-form"
import { Leaf } from "@/components/shared/leaf"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ROLE_HOME } from "@/constants/routes"
import { useOwnerProfile } from "@/hooks/use-profile"
import { getErrorMessage } from "@/lib/api/form-errors"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import type { OwnerProfile } from "@/types/owner"

const STEPS = [
  { title: "Business profile", description: "Trade license, NID and address", icon: BadgeCheckIcon },
  { title: "List a warehouse", description: "Location, capacity and photos", icon: BuildingIcon },
  { title: "Admin approval", description: "We verify it within a day or two", icon: ShieldCheckIcon },
  { title: "Add chambers", description: "Set temperatures and rates, then take bookings", icon: SnowflakeIcon },
]

export function OwnerOnboarding() {
  const profile = useOwnerProfile()

  if (profile.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Couldn&apos;t load your business profile</AlertTitle>
        <AlertDescription>
          <p>{getErrorMessage(profile.error)}</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={() => profile.refetch()}>
            <RotateCwIcon data-icon="inline-start" aria-hidden />
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (profile.data === undefined) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading business profile">
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    )
  }

  return profile.data === null ? <CreateProfile /> : <EditProfile profile={profile.data} />
}

function CreateProfile() {
  const router = useRouter()
  const firstName = useAuthStore((state) => state.user?.name.split(" ")[0] ?? "there")

  const onSaved = () => {
    toast.success("Business profile created", { description: "Your owner workspace is unlocked. Next, list a warehouse." })
    router.replace(ROLE_HOME.WAREHOUSE_OWNER)
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <section className="relative overflow-hidden rounded-3xl bg-forest p-6 text-forest-foreground sm:p-8">
        <Leaf className="absolute -top-4 right-10 size-28 rotate-12 text-forest-foreground/10" />
        <Leaf className="absolute right-40 -bottom-8 size-20 -rotate-45 text-forest-foreground/5" />
        <div className="relative flex flex-col gap-2">
          <p className="text-sm font-medium text-harvest">Welcome to AgroStore, {firstName}</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Set up your business</h1>
          <p className="max-w-xl text-sm text-forest-foreground/80">
            A few details about your business unlock your owner workspace. It takes about two minutes.
          </p>
        </div>
        <ol className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((step, index) => {
            const current = index === 0
            return (
              <li
                key={step.title}
                aria-current={current ? "step" : undefined}
                className={cn(
                  "flex items-start gap-3 rounded-2xl p-3",
                  current ? "bg-forest-foreground/10 ring-1 ring-harvest/60" : "bg-forest-foreground/5"
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                    current ? "bg-harvest text-harvest-foreground" : "bg-forest-foreground/10 text-forest-foreground/70"
                  )}
                >
                  {index + 1}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className={cn("text-sm font-semibold", !current && "text-forest-foreground/80")}>
                    {step.title}
                  </span>
                  <span className="text-xs text-forest-foreground/65">{step.description}</span>
                </span>
              </li>
            )
          })}
        </ol>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section
          aria-labelledby="business-heading"
          className="flex flex-col gap-5 rounded-3xl border border-soil/10 bg-card p-5 sm:p-6"
        >
          <div className="flex flex-col gap-1">
            <h2 id="business-heading" className="font-display text-xl font-semibold">
              Business details
            </h2>
            <p className="text-sm text-muted-foreground">All fields are required.</p>
          </div>
          <OwnerProfileForm profile={null} submitLabel="Create business profile" onSaved={onSaved} />
        </section>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <div className="flex flex-col gap-3 rounded-3xl border border-soil/10 bg-cream/70 p-5 dark:bg-muted/30">
            <h2 className="font-semibold">Why we ask</h2>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                Farmers trust listings from verified businesses, so admins check your license before approving a
                warehouse.
              </li>
              <li className="flex gap-2.5">
                <LockKeyholeIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                Your NID and license number are never shown to farmers.
              </li>
              <li className="flex gap-2.5">
                <CalendarCheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                You can edit these details any time from Business profile.
              </li>
            </ul>
          </div>
          <p className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
            <LockKeyholeIcon className="size-3.5" aria-hidden />
            Warehouses and booking requests unlock after this step.
          </p>
        </aside>
      </div>
    </div>
  )
}

function EditProfile({ profile }: { profile: OwnerProfile }) {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title="Business profile"
        description="The business behind your warehouse listings. Admins use it to verify new warehouses."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section
          aria-labelledby="business-heading"
          className="flex flex-col gap-5 rounded-3xl border border-soil/10 bg-card p-5 sm:p-6"
        >
          <h2 id="business-heading" className="font-display text-xl font-semibold">
            Business details
          </h2>
          <OwnerProfileForm key={profile.updatedAt} profile={profile} submitLabel="Save changes" />
        </section>
        <aside className="flex flex-col gap-4 rounded-3xl bg-forest p-6 text-forest-foreground lg:sticky lg:top-20 lg:self-start">
          <span className="flex size-12 items-center justify-center rounded-[55%_45%_50%_50%/60%_50%_50%_40%] bg-harvest text-harvest-foreground">
            <CheckIcon className="size-6" aria-hidden />
          </span>
          <div>
            <p className="font-display text-xl font-semibold">{profile.businessName}</p>
            <p className="text-sm text-forest-foreground/75">
              {profile.district} · on AgroStore since {format(parseISO(profile.createdAt), "MMMM yyyy")}
            </p>
          </div>
          <p className="text-sm text-forest-foreground/75">
            Profile complete. You can list warehouses and manage booking requests.
          </p>
        </aside>
      </div>
    </div>
  )
}
