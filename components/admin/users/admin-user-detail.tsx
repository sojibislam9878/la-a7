"use client"

import { useState } from "react"
import Link from "next/link"
import { format, formatDistanceToNowStrict, parseISO } from "date-fns"
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  BuildingIcon,
  CalendarIcon,
  CalendarCheckIcon,
  EyeIcon,
  EyeOffIcon,
  HistoryIcon,
  LockIcon,
  type LucideIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  RotateCwIcon,
  SearchXIcon,
  SproutIcon,
  WarehouseIcon,
} from "lucide-react"

import { BanDialog, lockReason, RoleDialog } from "@/components/admin/users/user-actions"
import { AccountStatusBadge, RoleBadge, SignInMethods } from "@/components/admin/users/user-badges"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { auditActionLabel } from "@/constants/audit-log"
import { useAdminUser, useAuditLogs } from "@/hooks/use-admin-users"
import { ApiError } from "@/lib/api/client"
import { getErrorMessage } from "@/lib/api/form-errors"
import { describeAudit } from "@/lib/audit-describe"
import { formatNumber, initials } from "@/lib/format"
import { useAuthStore } from "@/stores/auth-store"
import type { AdminUserDetail as Detail } from "@/types/admin"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function NotFound() {
  return (
    <EmptyState
      icon={SearchXIcon}
      title="User not found"
      description="The link may be wrong, or the account never existed."
      action={
        <Button className="rounded-full" asChild>
          <Link href="/admin/users">Back to users</Link>
        </Button>
      }
    />
  )
}

export function AdminUserDetail({ id }: { id: string }) {
  if (!UUID.test(id)) return <NotFound />
  return <UserView id={id} />
}

function Row({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium break-words">{children}</dd>
      </div>
    </div>
  )
}

function MaskedNid({ nid }: { nid: string | null }) {
  const [shown, setShown] = useState(false)
  if (!nid) return <>Not added</>
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-mono">{shown ? nid : `•••• ${nid.slice(-4)}`}</span>
      <button
        type="button"
        onClick={() => setShown((value) => !value)}
        className="rounded text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={shown ? "Hide NID" : "Show NID"}
        aria-pressed={shown}
      >
        {shown ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
      </button>
    </span>
  )
}

const card = "flex flex-col gap-4 rounded-3xl border border-soil/10 bg-card p-5 sm:p-6"

function UserView({ id }: { id: string }) {
  const selfId = useAuthStore((state) => state.user?.id)
  const user = useAdminUser(id)

  if (user.isError) {
    if (user.error instanceof ApiError && user.error.status === 404) return <NotFound />
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Couldn&apos;t load this user</AlertTitle>
        <AlertDescription>
          <p>{getErrorMessage(user.error)}</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={() => user.refetch()}>
            <RotateCwIcon data-icon="inline-start" aria-hidden />
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }
  if (!user.data) return <DashboardSkeleton />

  const data = user.data
  const locked = lockReason(data, selfId)

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Button variant="ghost" size="sm" className="-ml-2 w-fit rounded-full text-muted-foreground" asChild>
          <Link href="/admin/users">
            <ArrowLeftIcon data-icon="inline-start" aria-hidden />
            Users
          </Link>
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="bg-harvest font-display text-lg font-semibold text-harvest-foreground">
                {initials(data.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-semibold tracking-tight sm:text-3xl">{data.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <RoleBadge role={data.role} />
                <AccountStatusBadge user={data} />
              </div>
            </div>
          </div>
          {locked ? (
            <p className="flex max-w-xs items-start gap-2 text-sm text-muted-foreground">
              <LockIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              {locked}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <RoleDialog user={data} />
              <BanDialog user={data} />
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="account-heading" className={card}>
          <h2 id="account-heading" className="font-display text-xl font-semibold">
            Account
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Row icon={MailIcon} label="Email">
              {data.email}
            </Row>
            <Row icon={PhoneIcon} label="Phone">
              {data.phone ?? "Not added"}
            </Row>
            <Row icon={CalendarIcon} label="Joined">
              {format(parseISO(data.createdAt), "MMM d, yyyy")}
            </Row>
            <Row icon={LockIcon} label="Sign-in">
              <SignInMethods user={data} />
            </Row>
            {data.deletedAt && (
              <Row icon={CalendarIcon} label="Deleted">
                {format(parseISO(data.deletedAt), "MMM d, yyyy")}
              </Row>
            )}
          </dl>
          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-cream/60 p-4 dark:bg-muted/40">
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarCheckIcon className="size-3.5" aria-hidden />
                Bookings
              </dt>
              <dd className="mt-1 text-2xl font-bold">{formatNumber(data.counts.bookings)}</dd>
            </div>
            <div className="rounded-2xl bg-cream/60 p-4 dark:bg-muted/40">
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <WarehouseIcon className="size-3.5" aria-hidden />
                Warehouses
              </dt>
              <dd className="mt-1 text-2xl font-bold">{formatNumber(data.counts.warehouses)}</dd>
            </div>
          </dl>
        </section>

        <ProfileCard user={data} />
      </div>

      <ActivityCard userId={data.id} />
    </div>
  )
}

function ProfileCard({ user }: { user: Detail }) {
  if (user.ownerProfile) {
    const profile = user.ownerProfile
    return (
      <section aria-labelledby="profile-heading" className={card}>
        <h2 id="profile-heading" className="font-display text-xl font-semibold">
          Business profile
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Row icon={BuildingIcon} label="Business">
            {profile.businessName}
          </Row>
          <Row icon={LockIcon} label="Trade license">
            <span className="font-mono">{profile.tradeLicenseNo}</span>
          </Row>
          <Row icon={LockIcon} label="National ID">
            <MaskedNid nid={profile.nid} />
          </Row>
          <Row icon={MapPinIcon} label="Address">
            {profile.address}, {profile.district}
          </Row>
        </dl>
        {user.counts.warehouses > 0 && (
          <Button variant="outline" size="sm" className="w-fit rounded-full" asChild>
            <Link href={`/admin/warehouses?status=ALL&q=${encodeURIComponent(user.name)}`}>See their warehouses</Link>
          </Button>
        )}
      </section>
    )
  }
  if (user.farmerProfile) {
    const profile = user.farmerProfile
    return (
      <section aria-labelledby="profile-heading" className={card}>
        <h2 id="profile-heading" className="font-display text-xl font-semibold">
          Farming profile
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Row icon={MapPinIcon} label="Location">
            {[profile.upazila, profile.district].filter(Boolean).join(", ")}
          </Row>
          <Row icon={SproutIcon} label="Farm size">
            {profile.farmSizeAcre === null ? "Not added" : `${profile.farmSizeAcre} acres`}
          </Row>
          <Row icon={LockIcon} label="National ID">
            <MaskedNid nid={profile.nid} />
          </Row>
        </dl>
      </section>
    )
  }
  return (
    <section aria-labelledby="profile-heading" className={card}>
      <h2 id="profile-heading" className="font-display text-xl font-semibold">
        Profile
      </h2>
      <p className="text-sm text-muted-foreground">
        {user.role === "WAREHOUSE_OWNER"
          ? "No business profile yet. Their owner workspace stays locked until they add one."
          : user.role === "FARMER"
            ? "No farming profile yet. It's optional for booking."
            : "Admins don't have a profile."}
      </p>
    </section>
  )
}

function ActivityCard({ userId }: { userId: string }) {
  const logs = useAuditLogs({ entityType: "User", entityId: userId, sortOrder: "desc", limit: 10 })

  return (
    <section aria-labelledby="activity-heading" className={card}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <HistoryIcon className="size-5 text-primary" aria-hidden />
          <h2 id="activity-heading" className="font-display text-xl font-semibold">
            Admin actions on this account
          </h2>
        </div>
        <Link
          href={`/admin/audit-logs?entity=${userId}`}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Full history
        </Link>
      </div>
      {logs.isError ? (
        <p className="text-sm text-destructive">{getErrorMessage(logs.error)}</p>
      ) : !logs.data ? (
        <Skeleton className="h-24 rounded-2xl" />
      ) : logs.data.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No bans or role changes yet.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {logs.data.items.map((entry) => {
            const title = auditActionLabel(entry.action)
            const { detail, reason } = describeAudit(entry)
            return (
              <li key={entry.id} className="flex flex-col gap-0.5 border-l-2 border-primary/30 pl-3">
                <p className="text-sm">
                  <span className="font-semibold">{title}</span>
                  {detail && <span className="text-muted-foreground"> · {detail}</span>}
                  {entry.actor && <span className="text-muted-foreground"> by {entry.actor.name}</span>}
                </p>
                {reason && <p className="text-sm text-muted-foreground">“{reason}”</p>}
                <time dateTime={entry.createdAt} className="text-xs text-muted-foreground">
                  {format(parseISO(entry.createdAt), "MMM d, yyyy 'at' h:mm a")} ·{" "}
                  {formatDistanceToNowStrict(parseISO(entry.createdAt), { addSuffix: true })}
                </time>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
