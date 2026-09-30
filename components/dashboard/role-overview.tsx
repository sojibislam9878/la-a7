"use client"

import Link from "next/link"
import {
  AlertCircleIcon,
  ArrowRightIcon,
  BadgeCheckIcon,
  BanknoteIcon,
  CalendarCheckIcon,
  CalendarClockIcon,
  CircleCheckBigIcon,
  ClipboardCheckIcon,
  DoorOpenIcon,
  type LucideIcon,
  PackageCheckIcon,
  RotateCwIcon,
  SearchIcon,
  UsersIcon,
  WarehouseIcon,
} from "lucide-react"

import { AdminInsights } from "@/components/admin/admin-insights"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard, type StatTone } from "@/components/dashboard/stat-card"
import { Leaf } from "@/components/shared/leaf"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardSummary } from "@/hooks/use-dashboard"
import { getErrorMessage } from "@/lib/api/form-errors"
import { formatMoney, formatNumber } from "@/lib/format"
import { useAuthStore } from "@/stores/auth-store"
import type { DashboardSummary } from "@/types/dashboard"
import type { Role } from "@/types/user"

type Stat = { label: string; value: string; hint?: string; icon: LucideIcon; tone: StatTone }
type QuickAction = { title: string; description: string; href: string; icon: LucideIcon }

function statsFor(summary: DashboardSummary): Stat[] {
  switch (summary.role) {
    case "FARMER":
      return [
        { label: "Total bookings", value: formatNumber(summary.totalBookings), icon: CalendarCheckIcon, tone: "leaf" },
        { label: "Active bookings", value: formatNumber(summary.activeBookings), hint: "Approved, paid or stored", icon: CalendarClockIcon, tone: "sky" },
        { label: "Completed", value: formatNumber(summary.completedBookings), icon: CircleCheckBigIcon, tone: "harvest" },
        { label: "Total spent", value: formatMoney(summary.totalSpentBdt), icon: BanknoteIcon, tone: "soil" },
      ]
    case "WAREHOUSE_OWNER":
      return [
        { label: "Warehouses", value: formatNumber(summary.totalWarehouses), icon: WarehouseIcon, tone: "leaf" },
        { label: "Approved", value: formatNumber(summary.approvedWarehouses), hint: "Visible to farmers", icon: BadgeCheckIcon, tone: "sky" },
        { label: "Chambers", value: formatNumber(summary.totalChambers), icon: DoorOpenIcon, tone: "soil" },
        { label: "Awaiting approval", value: formatNumber(summary.bookingsAwaitingApproval), hint: "Booking requests to review", icon: CalendarClockIcon, tone: "harvest" },
      ]
    case "ADMIN":
      return [
        { label: "Users", value: formatNumber(summary.totalUsers), icon: UsersIcon, tone: "leaf" },
        { label: "Warehouses to review", value: formatNumber(summary.warehousesAwaitingApproval), icon: WarehouseIcon, tone: "harvest" },
        { label: "Bookings", value: formatNumber(summary.totalBookings), icon: CalendarCheckIcon, tone: "sky" },
        { label: "Platform revenue", value: formatMoney(summary.platformRevenueBdt), icon: BanknoteIcon, tone: "soil" },
      ]
  }
}

const COPY: Record<Role, { description: string; actions: QuickAction[] }> = {
  FARMER: {
    description: "Here's how your cold storage is doing.",
    actions: [
      { title: "Find storage", description: "Search approved warehouses near you", href: "/warehouses", icon: SearchIcon },
      { title: "My bookings", description: "Track, pay and withdraw your lots", href: "/farmer/bookings", icon: CalendarCheckIcon },
      { title: "Payments", description: "Receipts and payment history", href: "/farmer/payments", icon: BanknoteIcon },
    ],
  },
  WAREHOUSE_OWNER: {
    description: "Keep your chambers full and your booking queue moving.",
    actions: [
      { title: "My warehouses", description: "Add warehouses, chambers and rates", href: "/owner/warehouses", icon: WarehouseIcon },
      { title: "Booking requests", description: "Approve, store and release lots", href: "/owner/bookings", icon: PackageCheckIcon },
      { title: "Business profile", description: "Trade license and NID details", href: "/owner/onboarding", icon: BadgeCheckIcon },
    ],
  },
  ADMIN: {
    description: "Platform health at a glance.",
    actions: [
      { title: "Review warehouses", description: "Approve or reject new listings", href: "/admin/warehouses", icon: WarehouseIcon },
      { title: "Inspections", description: "Grade produce at intake", href: "/admin/inspections", icon: ClipboardCheckIcon },
      { title: "Manage users", description: "Roles, bans and account details", href: "/admin/users", icon: UsersIcon },
    ],
  },
}

export function RoleOverview({ role }: { role: Role }) {
  const user = useAuthStore((state) => state.user)
  const summary = useDashboardSummary()
  const copy = COPY[role]
  const firstName = user?.name.split(" ")[0] ?? "there"

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={`Welcome back, ${firstName}`} description={copy.description} />

      {summary.data?.role === "WAREHOUSE_OWNER" && !summary.data.profileComplete && <OwnerProfileBanner />}

      {summary.isError ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Could not load your dashboard</AlertTitle>
          <AlertDescription>
            <p>{getErrorMessage(summary.error)}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => summary.refetch()}>
              <RotateCwIcon data-icon="inline-start" aria-hidden />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <section aria-label="Summary" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {summary.data
            ? statsFor(summary.data).map((stat) => <StatCard key={stat.label} {...stat} />)
            : Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32 rounded-2xl sm:h-[8.5rem]" />)}
        </section>
      )}

      {role === "ADMIN" && <AdminInsights />}

      <section aria-labelledby="quick-actions" className="flex flex-col gap-4">
        <h2 id="quick-actions" className="text-lg font-semibold">
          Quick actions
        </h2>
        <ul className="grid gap-4 xl:grid-cols-3">
          {copy.actions.map((action) => (
            <li key={action.href}>
              <Link
                href={action.href}
                className="group flex h-full items-center gap-4 rounded-2xl border border-soil/10 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <action.icon className="size-5" aria-hidden />
                </span>
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="font-semibold">{action.title}</span>
                  <span className="text-sm text-muted-foreground">{action.description}</span>
                </span>
                <ArrowRightIcon
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function OwnerProfileBanner() {
  return (
    <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-forest p-6 text-forest-foreground sm:flex-row sm:items-center sm:justify-between">
      <Leaf className="absolute -top-2 right-24 size-20 rotate-12 text-forest-foreground/10" />
      <div className="relative flex flex-col gap-1">
        <p className="font-display text-xl font-semibold">Complete your business profile</p>
        <p className="text-sm text-forest-foreground/80">
          Add your trade license and NID to start listing warehouses. Every owner action unlocks after this step.
        </p>
      </div>
      <Button className="relative shrink-0 rounded-full bg-harvest text-harvest-foreground hover:bg-harvest/90" asChild>
        <Link href="/owner/onboarding">
          Complete profile
          <ArrowRightIcon data-icon="inline-end" aria-hidden />
        </Link>
      </Button>
    </div>
  )
}
