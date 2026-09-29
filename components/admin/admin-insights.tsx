"use client"

import { AlertCircleIcon, RotateCwIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { BOOKING_STATUS, LIFECYCLE } from "@/constants/booking-status"
import { ROLE_LABEL } from "@/constants/routes"
import { WAREHOUSE_STATUS } from "@/constants/warehouse-status"
import { useAdminStats } from "@/hooks/use-admin"
import { getErrorMessage } from "@/lib/api/form-errors"
import { formatKg, formatMoney, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { PlatformStats } from "@/types/admin"
import type { BookingStatus } from "@/types/booking"
import type { Role } from "@/types/user"
import type { WarehouseStatus } from "@/types/warehouse"

const STATUS_COLOR: Record<WarehouseStatus, string> = {
  APPROVED: "#0ca30c",
  PENDING: "#fab219",
  REJECTED: "#d03b3b",
  SUSPENDED: "#ec835a",
}
const WAREHOUSE_ORDER: WarehouseStatus[] = ["APPROVED", "PENDING", "REJECTED", "SUSPENDED"]
const CLOSED_BOOKINGS: BookingStatus[] = ["REJECTED", "CANCELLED", "EXPIRED"]
const ROLE_ORDER: Role[] = ["FARMER", "WAREHOUSE_OWNER", "ADMIN"]

type BarItem = { key: string; label: string; value: number }

const share = (value: number, total: number) => (total > 0 ? Math.round((value / total) * 100) : 0)

function Card({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col gap-5 rounded-3xl border border-soil/10 bg-card p-5 sm:p-6", className)}>
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function BarList({ items, max, total, unit }: { items: BarItem[]; max: number; total: number; unit?: (value: number) => string }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const width = max > 0 ? (item.value / max) * 100 : 0
        const valueText = unit ? unit(item.value) : formatNumber(item.value)
        return (
          <li key={item.key}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)_2.5rem] items-center gap-3 rounded-lg px-1 py-1.5 hover:bg-muted/50 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_2.5rem]">
                  <span className="truncate text-sm text-muted-foreground">{item.label}</span>
                  <span className="h-3 min-w-0" aria-hidden>
                    <span
                      className="block h-full rounded-r-[4px] bg-primary transition-[width]"
                      style={{ width: `${width}%` }}
                    />
                  </span>
                  <span className="text-right text-sm font-semibold tabular-nums">{formatNumber(item.value)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                {item.label}: {valueText} · {share(item.value, total)}% of total
              </TooltipContent>
            </Tooltip>
          </li>
        )
      })}
    </ul>
  )
}

function WarehouseSplit({ byStatus, total }: { byStatus: PlatformStats["warehouses"]["byStatus"]; total: number }) {
  const segments = WAREHOUSE_ORDER.map((status) => ({ status, value: byStatus[status] ?? 0 }))

  return (
    <div className="flex flex-col gap-4">
      {total > 0 ? (
        <div className="flex h-6 w-full gap-0.5" role="img" aria-label={segments.map((s) => `${WAREHOUSE_STATUS[s.status].label} ${s.value}`).join(", ")}>
          {segments
            .filter((segment) => segment.value > 0)
            .map((segment, index, visible) => (
              <Tooltip key={segment.status}>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      "h-full min-w-1.5",
                      index === 0 && "rounded-l-[4px]",
                      index === visible.length - 1 && "rounded-r-[4px]"
                    )}
                    style={{ flexGrow: segment.value, backgroundColor: STATUS_COLOR[segment.status] }}
                  />
                </TooltipTrigger>
                <TooltipContent side="top">
                  {WAREHOUSE_STATUS[segment.status].label}: {segment.value} · {share(segment.value, total)}%
                </TooltipContent>
              </Tooltip>
            ))}
        </div>
      ) : (
        <div className="h-6 rounded-[4px] bg-muted" />
      )}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
        {segments.map(({ status, value }) => {
          const meta = WAREHOUSE_STATUS[status]
          return (
            <li key={status} className="flex items-center gap-2 text-sm">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: STATUS_COLOR[status] }} aria-hidden />
              <meta.icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="text-muted-foreground">{meta.label}</span>
              <span className="ml-auto font-semibold tabular-nums">{value}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function AdminInsights() {
  const stats = useAdminStats()

  if (stats.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Couldn&apos;t load platform stats</AlertTitle>
        <AlertDescription>
          <p>{getErrorMessage(stats.error)}</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={() => stats.refetch()}>
            <RotateCwIcon data-icon="inline-start" aria-hidden />
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!stats.data) {
    return (
      <div className="grid gap-4 lg:grid-cols-2" aria-busy="true" aria-label="Loading platform stats">
        <Skeleton className="h-96 rounded-3xl lg:row-span-2" />
        <Skeleton className="h-44 rounded-3xl" />
        <Skeleton className="h-44 rounded-3xl" />
        <Skeleton className="h-56 rounded-3xl" />
        <Skeleton className="h-56 rounded-3xl" />
      </div>
    )
  }

  const { users, warehouses, chambers, bookings, payments, topDistricts } = stats.data
  const bookingItem = (status: BookingStatus): BarItem => ({
    key: status,
    label: BOOKING_STATUS[status].label.replace(", pay now", ""),
    value: bookings.byStatus[status] ?? 0,
  })
  const inProgress = LIFECYCLE.map(bookingItem)
  const closed = CLOSED_BOOKINGS.map(bookingItem)
  const bookingMax = Math.max(0, ...inProgress.map((i) => i.value), ...closed.map((i) => i.value))
  const roleItems = ROLE_ORDER.map((role) => ({ key: role, label: `${ROLE_LABEL[role]}s`, value: users.byRole[role] ?? 0 }))
  const districtItems = topDistricts.map((row) => ({ key: row.district, label: row.district, value: row.warehouses }))
  const approved = warehouses.byStatus.APPROVED ?? 0

  return (
    <section aria-labelledby="insights-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="insights-heading" className="text-lg font-semibold">
          Platform insights
        </h2>
        <p className="text-xs text-muted-foreground">Refreshed every few minutes</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Bookings by stage"
          description={`${formatNumber(bookings.total)} bookings, ${formatNumber(payments.succeeded)} paid through Stripe for ${formatMoney(payments.revenueBdt)}.`}
          className="lg:row-span-2"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">In progress</p>
              <BarList items={inProgress} max={bookingMax} total={bookings.total} />
            </div>
            <div className="flex flex-col gap-1.5 border-t border-soil/10 pt-4">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Closed</p>
              <BarList items={closed} max={bookingMax} total={bookings.total} />
            </div>
          </div>
        </Card>

        <Card
          title="Warehouses by status"
          description={`${approved} of ${warehouses.total} are live for farmers.`}
        >
          <WarehouseSplit byStatus={warehouses.byStatus} total={warehouses.total} />
        </Card>

        <Card
          title="Cold storage capacity"
          description="Every chamber across all warehouses, active or paused."
        >
          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-cream/60 p-4 dark:bg-muted/40">
              <dt className="text-xs text-muted-foreground">Total capacity</dt>
              <dd className="mt-1 text-2xl font-bold tracking-tight">{formatKg(chambers.totalCapacityKg)}</dd>
            </div>
            <div className="rounded-2xl bg-cream/60 p-4 dark:bg-muted/40">
              <dt className="text-xs text-muted-foreground">Chambers</dt>
              <dd className="mt-1 text-2xl font-bold tracking-tight">{formatNumber(chambers.total)}</dd>
            </div>
          </dl>
        </Card>

        <Card
          title="Users by role"
          description={`${formatNumber(users.active)} active · ${formatNumber(users.banned)} banned · ${formatNumber(users.unverified)} unverified · ${formatNumber(users.deleted)} deleted`}
        >
          <BarList items={roleItems} max={Math.max(0, ...roleItems.map((i) => i.value))} total={users.total} />
        </Card>

        <Card title="Top districts" description="Approved warehouses per district.">
          {districtItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No approved warehouses yet.</p>
          ) : (
            <BarList
              items={districtItems}
              max={Math.max(...districtItems.map((i) => i.value))}
              total={approved}
              unit={(value) => `${value} ${value === 1 ? "warehouse" : "warehouses"}`}
            />
          )}
        </Card>
      </div>
    </section>
  )
}
